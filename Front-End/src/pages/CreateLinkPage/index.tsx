import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createLink, type LinkResponse } from '../../lib/api';
import { getStoredCreatorId, setStoredCreatorId } from '../../lib/preferences';

type FormState = {
    longUrl: string;
    customAlias: string;
    creatorId: string;
    expiresAt: string;
};

function toIsoString(value: string): string | undefined {
    if (!value) {
        return undefined;
    }

    return new Date(value).toISOString();
}

export default function CreateLinkPage() {
    const [formState, setFormState] = useState<FormState>({
        longUrl: '',
        customAlias: '',
        creatorId: getStoredCreatorId(),
        expiresAt: '',
    });
    const [createdLink, setCreatedLink] = useState<LinkResponse | null>(null);

    const mutation = useMutation({
        mutationFn: () =>
            createLink({
                longUrl: formState.longUrl.trim(),
                customAlias: formState.customAlias.trim() || undefined,
                creatorId: formState.creatorId.trim() || undefined,
                expiresAt: toIsoString(formState.expiresAt),
            }),
        onSuccess: (response) => {
            setCreatedLink(response);
            setStoredCreatorId(formState.creatorId);
        },
    });

    function updateField(field: keyof FormState, value: string) {
        setFormState((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setCreatedLink(null);
        mutation.mutate();
    }

    return (
        <section className="page">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Create</p>
                    <h1>Create a short link</h1>
                </div>
            </div>

            <div className="two-column-layout">
                <form className="panel form-panel" onSubmit={handleSubmit}>
                    <label className="field">
                        <span>Long URL</span>
                        <input
                            type="url"
                            placeholder="https://www.rice.edu"
                            value={formState.longUrl}
                            onChange={(event) => updateField('longUrl', event.target.value)}
                            required
                        />
                    </label>

                    <label className="field">
                        <span>Custom alias</span>
                        <input
                            type="text"
                            placeholder="Optional, 4-32 chars"
                            value={formState.customAlias}
                            onChange={(event) => updateField('customAlias', event.target.value)}
                        />
                    </label>

                    <label className="field">
                        <span>Creator ID</span>
                        <input
                            type="text"
                            placeholder="team-member-id"
                            value={formState.creatorId}
                            onChange={(event) => updateField('creatorId', event.target.value)}
                        />
                    </label>

                    <label className="field">
                        <span>Expires at</span>
                        <input
                            type="datetime-local"
                            value={formState.expiresAt}
                            onChange={(event) => updateField('expiresAt', event.target.value)}
                        />
                    </label>

                    <div className="button-row">
                        <button type="submit" className="button button-primary" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Creating...' : 'Create link'}
                        </button>
                    </div>

                    {mutation.isError ? <p className="error-text">{mutation.error.message}</p> : null}
                </form>

                <aside className="panel">
                    <h2>Result</h2>

                    {createdLink ? (
                        <div className="result-card">
                            <div>
                                <span className="result-label">Alias</span>
                                <strong>{createdLink.alias}</strong>
                            </div>
                            <div>
                                <span className="result-label">Short URL</span>
                                <a href={createdLink.shortUrl} target="_blank" rel="noreferrer">
                                    {createdLink.shortUrl}
                                </a>
                            </div>
                            <div>
                                <span className="result-label">Long URL</span>
                                <a href={createdLink.longUrl} target="_blank" rel="noreferrer">
                                    {createdLink.longUrl}
                                </a>
                            </div>
                        </div>
                    ) : (
                        <p className="muted-text">Submit the form to see the backend response here.</p>
                    )}
                </aside>
            </div>
        </section>
    );
}
