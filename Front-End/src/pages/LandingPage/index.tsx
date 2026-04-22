import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <section className="page">
            <div className="hero-card">
                <p className="eyebrow">Atlas URL Shortener</p>
                <h1>Frontend MVP shell is ready to connect to the backend.</h1>
                <p className="hero-copy">
                    Use the app area to create short links, inspect aliases, and test redirects against the Spring Boot
                    service that already exists in this repo.
                </p>

                <div className="button-row">
                    <Link to="/app/create" className="button button-primary">
                        Create a link
                    </Link>
                    <Link to="/app/links" className="button button-secondary">
                        Browse links
                    </Link>
                </div>
            </div>
        </section>
    );
}
