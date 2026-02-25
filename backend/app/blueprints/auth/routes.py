"""
Authentication routes.
Handles user registration, login, and admin seeding.
"""

from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.blueprints.auth import auth_bp
from app import db
from app.models.user import User

_admin_seeded = False


def seed_admin():
    """Create the one-and-only admin account if it doesn't exist yet.
    Credentials: admin@contractshield.com / Admin@1234
    """
    try:
        if not User.query.filter_by(role='admin').first():
            admin = User(
                email='admin@contractshield.com',
                password='Admin@1234',
                full_name='Super Admin',
                role='admin',
            )
            db.session.add(admin)
            db.session.commit()
            print('[Auth] Admin account created: admin@contractshield.com / Admin@1234')
    except Exception as e:
        print(f'[Auth] seed_admin skipped (DB not ready): {e}')
        db.session.rollback()


@auth_bp.before_app_request
def ensure_admin():
    """Seed admin on first request only (once per server lifetime)."""
    global _admin_seeded
    if not _admin_seeded:
        seed_admin()
        _admin_seeded = True


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user (client or lawyer)."""
    try:
        data = request.get_json()

        required_fields = ['email', 'password', 'full_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'error': 'Email already registered'}), 400

        role = data.get('role', 'client')
        # Prevent API-level admin creation
        if role == 'admin':
            return jsonify({'success': False, 'error': 'Admin accounts cannot be self-registered'}), 403

        # Build kwargs for lawyer profile fields
        lawyer_fields = {}
        if role == 'lawyer':
            for f in ['specialization', 'experience_yrs', 'bar_council_id',
                      'bio', 'hourly_rate', 'location']:
                if f in data:
                    lawyer_fields[f] = data[f]

        user = User(
            email=data['email'],
            password=data['password'],
            full_name=data['full_name'],
            role=role,
            **lawyer_fields
        )

        db.session.add(user)
        db.session.commit()

        msg = (f'{role.capitalize()} registered successfully'
               if role != 'lawyer'
               else 'Lawyer registered! Your account is pending admin approval.')

        return jsonify({
            'success': True,
            'message': msg,
            'user': user.to_dict(),
            'pending_approval': (role == 'lawyer'),
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token."""
    try:
        data = request.get_json()

        if not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400

        user = User.query.filter_by(email=data['email']).first()

        if not user or not user.check_password(data['password']):
            return jsonify({'success': False, 'error': 'Invalid email or password'}), 401

        # Lawyers must be approved before they can log in
        if user.role == 'lawyer' and not user.is_approved:
            return jsonify({
                'success': False,
                'error': 'Your lawyer account is pending admin approval.',
                'pending_approval': True,
            }), 403

        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'success': True,
            'access_token': access_token,
            'role': user.role,
            'user': user.to_dict(),
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'success': True, 'message': 'Auth blueprint is working!'}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user = User.query.get_or_404(int(get_jwt_identity()))
    return jsonify({'success': True, 'user': user.to_dict(include_sensitive=True)}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user = User.query.get_or_404(int(get_jwt_identity()))
    data = request.get_json() or {}
    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
    if 'email' in data and data['email'].strip():
        ex = User.query.filter_by(email=data['email']).first()
        if ex and ex.id != user.id:
            return jsonify({'success': False, 'error': 'Email already in use'}), 409
        user.email = data['email'].strip()
    if 'password' in data and len(data['password']) >= 6:
        user.set_password(data['password'])
    if user.role == 'lawyer':
        for f in ['specialization', 'bio', 'location', 'bar_council_id']:
            if f in data:
                setattr(user, f, data[f])
        if 'experience_yrs' in data:
            user.experience_yrs = int(data['experience_yrs']) if data['experience_yrs'] else None
        if 'hourly_rate' in data:
            user.hourly_rate = float(data['hourly_rate']) if data['hourly_rate'] else None
        if 'available' in data:
            user.available = bool(data['available'])
    db.session.commit()
    return jsonify({'success': True, 'user': user.to_dict(include_sensitive=True), 'message': 'Profile updated'}), 200


@auth_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user = User.query.get_or_404(int(get_jwt_identity()))
    if user.role == 'admin':
        return jsonify({'success': False, 'error': 'Admin cannot self-delete'}), 403
    db.session.delete(user)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Account deleted'}), 200


@auth_bp.route('/users/<int:uid>', methods=['GET'])
@jwt_required()
def get_user(uid):
    user = User.query.get_or_404(uid)
    return jsonify({'success': True, 'user': user.to_dict()}), 200
