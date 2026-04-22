import { useState, type FormEvent } from 'react';
import { getStoredCreatorId, setStoredCreatorId } from '../../lib/preferences';

export default function SettingsPage() {
    const [creatorId, setCreatorId] = useState(getStoredCreatorId());
    const [saved, setSaved] = useState(false);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStoredCreatorId(creatorId);
        setSaved(true);
    }

    return (
        <section className="page">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Settings</p>
                    <h1>Local frontend preferences</h1>
                </div>
            </div>

            <form className="panel form-panel" onSubmit={handleSubmit}>
                <label className="field">
                    <span>Default creator ID</span>
                    <input
                        type="text"
                        value={creatorId}
                        onChange={(event) => {
                            setCreatorId(event.target.value);
                            setSaved(false);
                        }}
                        placeholder="owner-1"
                    />
                </label>

                <button type="submit" className="button button-primary">
                    Save preference
                </button>

                <p className="muted-text">
                    This value is stored in `localStorage` and pre-fills the create and list screens.
                </p>
                {saved ? <p className="success-text">Saved.</p> : null}
            </form>
        </section>
    );
}
