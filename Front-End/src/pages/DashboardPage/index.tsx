import { Link } from 'react-router-dom';
import { getStoredCreatorId } from '../../lib/preferences';

export default function DashboardPage() {
    const creatorId = getStoredCreatorId();

    return (
        <section className="page">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Dashboard</p>
                    <h1>MVP status</h1>
                </div>
                <Link to="/app/create" className="button button-primary">
                    New short link
                </Link>
            </div>

            <div className="stats-grid">
                <article className="stat-card">
                    <span className="stat-label">Backend routes</span>
                    <strong>4 active endpoints</strong>
                    <p>`POST /api/links`, `GET /api/links`, `GET /api/links/{'{alias}'}`, `GET /r/{'{alias}'}`</p>
                </article>

                <article className="stat-card">
                    <span className="stat-label">Current creator</span>
                    <strong>{creatorId || 'Not set yet'}</strong>
                    <p>Set a default creator ID in Settings to make list and create flows faster.</p>
                </article>

                <article className="stat-card">
                    <span className="stat-label">Storage modes</span>
                    <strong>Memory or Bigtable</strong>
                    <p>The backend already supports both, depending on Spring config.</p>
                </article>
            </div>

            <div className="panel">
                <h2>What this frontend already supports</h2>
                <div className="list-stack">
                    <p>Create a short link with an optional custom alias and expiration timestamp.</p>
                    <p>Save a default creator ID locally so list requests can use the backend pagination API.</p>
                    <p>Open a detail screen for any alias and test the live redirect URL returned by the service.</p>
                </div>
            </div>
        </section>
    );
}
