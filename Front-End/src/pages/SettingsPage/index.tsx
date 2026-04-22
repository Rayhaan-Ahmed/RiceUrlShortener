import { useState, type FormEvent } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { checkNameExists, checkEmailExists } from '../../services/authApi';
import { getStoredCreatorId, setStoredCreatorId } from '../../lib/preferences';

export default function SettingsPage() {
    const { user, updateProfile } = useAuth();

    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [creatorId, setCreatorId] = useState(getStoredCreatorId() || user?.name || '');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [creatorSaved, setCreatorSaved] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user) return;

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
            if (name !== user.name) {
                const nameTaken = await checkNameExists(name, user.id);
                if (nameTaken) {
                    setError('This username is already taken');
                    setLoading(false);
                    return;
                }
            }

            if (email !== user.email) {
                const emailTaken = await checkEmailExists(email, user.id);
                if (emailTaken) {
                    setError('This email is already in use');
                    setLoading(false);
                    return;
                }
            }

            const updates: { name?: string; email?: string; password?: string } = {};
            if (name !== user.name) updates.name = name;
            if (email !== user.email) updates.email = email;
            if (password) updates.password = password;

            if (Object.keys(updates).length === 0) {
                setError('No changes to save');
                setLoading(false);
                return;
            }

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
    }

    function handleCreatorSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStoredCreatorId(creatorId);
        setCreatorSaved(true);
    }

    return (
        <section className="page">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Settings</p>
                    <h1>Profile and frontend preferences</h1>
                </div>
            </div>

            <div className="two-column-layout">
                <form className="panel form-panel" onSubmit={handleSubmit}>
                    <h2>Edit profile</h2>

                    <label className="field">
                        <span>Username</span>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </label>

                    <label className="field">
                        <span>Email</span>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </label>

                    <label className="field">
                        <span>New password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave blank to keep the current password"
                        />
                    </label>

                    <label className="field">
                        <span>Confirm new password</span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                    </label>

                    {error ? <p className="error-text">{error}</p> : null}
                    {success ? <p className="success-text">{success}</p> : null}

                    <button type="submit" className="button button-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save profile'}
                    </button>
                </form>

                <form className="panel form-panel" onSubmit={handleCreatorSave}>
                    <h2>Link page preference</h2>

                    <label className="field">
                        <span>Default creator ID</span>
                        <input
                            type="text"
                            value={creatorId}
                            onChange={(event) => {
                                setCreatorId(event.target.value);
                                setCreatorSaved(false);
                            }}
                            placeholder="owner-1"
                        />
                    </label>

                    <button type="submit" className="button button-primary">
                        Save preference
                    </button>

                    <p className="muted-text">
                        This value is stored in localStorage and pre-fills the create and list screens.
                    </p>
                    {creatorSaved ? <p className="success-text">Saved.</p> : null}
                </form>
            </div>
        </section>
    );
}
