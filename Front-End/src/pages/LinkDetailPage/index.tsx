import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getLink } from '../../lib/api';

export default function LinkDetailPage() {
    const { alias = '' } = useParams();

    const query = useQuery({
        queryKey: ['link', alias],
        queryFn: () => getLink(alias),
        enabled: Boolean(alias),
    });

    return (
        <section className="page">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Link detail</p>
                    <h1>{alias}</h1>
                </div>
                <Link to="/app/links" className="button button-secondary">
                    Back to links
                </Link>
            </div>

            {query.isLoading ? <div className="panel"><p>Loading link...</p></div> : null}
            {query.isError ? <div className="panel"><p className="error-text">{query.error.message}</p></div> : null}

            {query.data ? (
                <div className="panel detail-grid">
                    <div>
                        <span className="result-label">Short URL</span>
                        <a href={query.data.shortUrl} target="_blank" rel="noreferrer">
                            {query.data.shortUrl}
                        </a>
                    </div>
                    <div>
                        <span className="result-label">Long URL</span>
                        <a href={query.data.longUrl} target="_blank" rel="noreferrer">
                            {query.data.longUrl}
                        </a>
                    </div>
                    <div>
                        <span className="result-label">Creator ID</span>
                        <strong>{query.data.creatorId || 'None'}</strong>
                    </div>
                    <div>
                        <span className="result-label">Clicks</span>
                        <strong>{query.data.clickCount}</strong>
                    </div>
                    <div>
                        <span className="result-label">Created at</span>
                        <strong>{new Date(query.data.createdAt).toLocaleString()}</strong>
                    </div>
                    <div>
                        <span className="result-label">Expires at</span>
                        <strong>{query.data.expiresAt ? new Date(query.data.expiresAt).toLocaleString() : 'No expiry'}</strong>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
