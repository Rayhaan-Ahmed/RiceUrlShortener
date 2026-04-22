import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <section className="page">
            <div className="hero-card">
                <p className="eyebrow">Atlas URL Shortener</p>
                <h1>Authenticated frontend plus backend-linked MVP flows.</h1>
                <p className="hero-copy">
                    Sign in to the management console, create short links against the Spring Boot backend, inspect
                    aliases, and test redirects against the running local service.
                </p>

                <div className="button-row">
                    <Link to="/login" className="button button-primary">
                        Sign in
                    </Link>
                    <Link to="/signup" className="button button-secondary">
                        Create account
                    </Link>
                </div>
            </div>
        </section>
    );
}
