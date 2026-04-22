import { useState } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { checkNameExists, checkEmailExists } from '../../services/authApi';

export default function SettingsPage() {
    const { user, updateProfile } = useAuth();

    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user) return;

        // Validate password match
        if (password && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password && password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            // Check if name changed and already exists
            if (name !== user.name) {
                const nameTaken = await checkNameExists(name, user.id);
                if (nameTaken) {
                    setError('This username is already taken');
                    setLoading(false);
                    return;
                }
            }

            // Check if email changed and already exists
            if (email !== user.email) {
                const emailTaken = await checkEmailExists(email, user.id);
                if (emailTaken) {
                    setError('This email is already in use');
                    setLoading(false);
                    return;
                }
            }

            // Build update payload with only changed fields
            const updates: { name?: string; email?: string; password?: string } = {};
            if (name !== user.name) updates.name = name;
            if (email !== user.email) updates.email = email;
            if (password) updates.password = password;

            if (Object.keys(updates).length === 0) {
                setError('No changes to save');
                setLoading(false);
                return;
            }

            // Keep unchanged fields in the update so the mock API returns the full user
            await updateProfile({
                name: updates.name ?? user.name,
                email: updates.email ?? user.email,
                ...(updates.password ? { password: updates.password } : {}),
            });

            setPassword('');
            setConfirmPassword('');
            setSuccess('Profile updated successfully');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid #d1d5db',
        fontSize: 15,
        outline: 'none',
        boxSizing: 'border-box',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: 6,
        fontSize: 14,
        fontWeight: 500,
        color: '#374151',
    };

    return (
        <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, color: '#111827' }}>Settings</h2>
            <p style={{ margin: '0 0 28px', fontSize: 14, color: '#6b7280' }}>
                Manage your profile information
            </p>

            <div
                style={{
                    maxWidth: 520,
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: 32,
                    border: '1px solid #e5e7eb',
                }}
            >
                <h3 style={{ margin: '0 0 20px', fontSize: 17, color: '#111827' }}>
                    Edit Profile
                </h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Username</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div
                        style={{
                            borderTop: '1px solid #e5e7eb',
                            paddingTop: 16,
                            marginTop: 4,
                        }}
                    >
                        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#6b7280' }}>
                            Leave password fields empty to keep your current password
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={labelStyle}>New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p style={{ margin: 0, color: '#dc2626', fontSize: 14 }}>{error}</p>
                    )}
                    {success && (
                        <p style={{ margin: 0, color: '#16a34a', fontSize: 14 }}>{success}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px 20px',
                            borderRadius: 10,
                            background: loading ? '#6b7280' : '#111827',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: 4,
                            alignSelf: 'flex-start',
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
