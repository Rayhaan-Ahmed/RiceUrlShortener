import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listLinks } from '../../lib/api';

export default function LinksPage() {
    const [cursor, setCursor] = useState<string | null>(null);

    const query = useQuery({
        queryKey: ['links', cursor],
        queryFn: () => listLinks(cursor),
    });

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setCursor(null);
        query.refetch();
    }

    return (
        <section className="page">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Links</p>
                    <h1>Your links</h1>
                </div>
            </div>

            <form className="panel inline-form" onSubmit={handleSubmit}>
                <button type="submit" className="button button-primary">
                    Refresh
                </button>
            </form>

            {query.isLoading ? <div className="panel"><p>Loading links...</p></div> : null}
            {query.isError ? <div className="panel"><p className="error-text">{query.error.message}</p></div> : null}

            {query.data ? (
                <div className="panel">
                    <div className="list-stack">
                        {query.data.items.length === 0 ? (
                            <p className="muted-text">No links found for your account.</p>
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
