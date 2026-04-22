import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../app/providers/AuthProvider';
import { Link } from 'react-router-dom';
import { listLinks } from '../../lib/api';
import { getStoredCreatorId, setStoredCreatorId } from '../../lib/preferences';

export default function LinksPage() {
    const { user } = useAuth();
    const initialCreatorId = getStoredCreatorId() || user?.name || '';
    const [creatorIdInput, setCreatorIdInput] = useState(initialCreatorId);
    const [activeCreatorId, setActiveCreatorId] = useState(initialCreatorId);
    const [cursor, setCursor] = useState<string | null>(null);

    const query = useQuery({
        queryKey: ['links', activeCreatorId, cursor],
        queryFn: () => listLinks(activeCreatorId, cursor),
        enabled: Boolean(activeCreatorId),
    });

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const normalizedCreatorId = creatorIdInput.trim();
        setStoredCreatorId(normalizedCreatorId);
        setCursor(null);
        setActiveCreatorId(normalizedCreatorId);
    }

    return (
        <section className="page">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Links</p>
                    <h1>Find links by creator ID</h1>
                </div>
            </div>

            <form className="panel inline-form" onSubmit={handleSubmit}>
                <label className="field field-grow">
                    <span>Creator ID</span>
                    <input
                        type="text"
                        value={creatorIdInput}
                        onChange={(event) => setCreatorIdInput(event.target.value)}
                        placeholder="owner-1"
                    />
                </label>
                <button type="submit" className="button button-primary">
                    Load links
                </button>
            </form>

            {!activeCreatorId ? (
                <div className="panel">
                    <p className="muted-text">Enter a creator ID to query `GET /api/links`.</p>
                </div>
            ) : null}

            {query.isLoading ? <div className="panel"><p>Loading links...</p></div> : null}
            {query.isError ? <div className="panel"><p className="error-text">{query.error.message}</p></div> : null}

            {query.data ? (
                <div className="panel">
                    <div className="list-stack">
                        {query.data.items.length === 0 ? (
                            <p className="muted-text">No links found for `{activeCreatorId}`.</p>
                        ) : (
                            query.data.items.map((item) => (
                                <article key={item.alias} className="link-row">
                                    <div>
                                        <p className="link-alias">{item.alias}</p>
                                        <a href={item.longUrl} target="_blank" rel="noreferrer" className="link-target">
                                            {item.longUrl}
                                        </a>
                                    </div>
                                    <div className="link-actions">
                                        <span>{item.clickCount} clicks</span>
                                        <Link to={`/app/links/${item.alias}`} className="button button-secondary">
                                            Details
                                        </Link>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>

                    {query.data.nextCursor ? (
                        <div className="button-row">
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={() => setCursor(query.data.nextCursor)}
                            >
                                Load next page
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
}
