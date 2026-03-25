import { useMemo, useState } from 'react';

type CreateLinkForm = {
    longUrl: string;
    customAlias: string;
    expiresAt: string;
    metadata: string;
};

type CreatedLinkResult = {
    alias: string;
    shortUrl: string;
    longUrl: string;
    expiresAt?: string;
};

const initialForm: CreateLinkForm = {
    longUrl: '',
    customAlias: '',
    expiresAt: '',
    metadata: '',
};

export default function CreateLinkPage() {
    const [form, setForm] = useState<CreateLinkForm>(initialForm);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [result, setResult] = useState<CreatedLinkResult | null>(null);

    const canSubmit = useMemo(() => {
        return form.longUrl.trim().length > 0;
    }, [form.longUrl]);

    function updateField<K extends keyof CreateLinkForm>(key: K, value: CreateLinkForm[K]) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function generateAliasFromUrl(url: string) {
        try {
            const parsed = new URL(url);
            const raw = parsed.hostname.replace(/^www\./, '').split('.')[0] || 'link';
            return `${raw}-${Math.random().toString(36).slice(2, 7)}`;
        } catch {
            return `link-${Math.random().toString(36).slice(2, 7)}`;
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage('');
        setResult(null);

        if (!form.longUrl.trim()) {
            setErrorMessage('Long URL is required.');
            return;
        }

        try {
            new URL(form.longUrl);
        } catch {
            setErrorMessage('Please enter a valid URL, including http:// or https://');
            return;
        }

        setLoading(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 700));

            const alias = form.customAlias.trim() || generateAliasFromUrl(form.longUrl);

            setResult({
                alias,
                shortUrl: `https://at.link/${alias}`,
                longUrl: form.longUrl.trim(),
                expiresAt: form.expiresAt.trim() || undefined,
            });

            setForm(initialForm);
        } catch {
            setErrorMessage('Failed to create link. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 920 }}>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 28, color: '#111827' }}>Create Link</h2>
                <p style={{ marginTop: 8, color: '#6b7280', lineHeight: 1.6 }}>
                    Create a short link through the management plane. In the real system, this
                    form will call the management API, while redirect traffic bypasses the frontend.
                </p>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr',
                    gap: 20,
                    alignItems: 'start',
                }}
            >
                <div
                    style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 16,
                        padding: 24,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                    }}
                >
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
                        <div>
                            <label
                                htmlFor="longUrl"
                                style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#111827' }}
                            >
                                Long URL
                            </label>
                            <input
                                id="longUrl"
                                type="text"
                                value={form.longUrl}
                                onChange={(e) => updateField('longUrl', e.target.value)}
                                placeholder="https://example.com/articles/system-design"
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    border: '1px solid #d1d5db',
                                    fontSize: 14,
                                }}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="customAlias"
                                style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#111827' }}
                            >
                                Custom Alias
                            </label>
                            <input
                                id="customAlias"
                                type="text"
                                value={form.customAlias}
                                onChange={(e) => updateField('customAlias', e.target.value)}
                                placeholder="my-demo-link"
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    border: '1px solid #d1d5db',
                                    fontSize: 14,
                                }}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="expiresAt"
                                style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#111827' }}
                            >
                                Expires At
                            </label>
                            <input
                                id="expiresAt"
                                type="datetime-local"
                                value={form.expiresAt}
                                onChange={(e) => updateField('expiresAt', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    border: '1px solid #d1d5db',
                                    fontSize: 14,
                                }}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="metadata"
                                style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#111827' }}
                            >
                                Metadata
                            </label>
                            <textarea
                                id="metadata"
                                value={form.metadata}
                                onChange={(e) => updateField('metadata', e.target.value)}
                                placeholder='{"campaign":"spring-launch","owner":"demo-user"}'
                                rows={5}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    border: '1px solid #d1d5db',
                                    fontSize: 14,
                                    resize: 'vertical',
                                }}
                            />
                        </div>

                        {errorMessage && (
                            <div
                                style={{
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#b91c1c',
                                    fontSize: 14,
                                }}
                            >
                                {errorMessage}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                type="submit"
                                disabled={!canSubmit || loading}
                                style={{
                                    padding: '12px 18px',
                                    borderRadius: 10,
                                    border: 'none',
                                    background: !canSubmit || loading ? '#9ca3af' : '#111827',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    cursor: !canSubmit || loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? 'Creating...' : 'Create Link'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setForm(initialForm);
                                    setErrorMessage('');
                                    setResult(null);
                                }}
                                style={{
                                    padding: '12px 18px',
                                    borderRadius: 10,
                                    border: '1px solid #d1d5db',
                                    background: '#ffffff',
                                    color: '#111827',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                <div
                    style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 16,
                        padding: 24,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                    }}
                >
                    <h3 style={{ marginTop: 0, color: '#111827' }}>Preview</h3>
                    <div style={{ display: 'grid', gap: 14 }}>
                        <div>
                            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Long URL</div>
                            <div style={{ color: '#111827', wordBreak: 'break-word' }}>
                                {form.longUrl || '—'}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Alias</div>
                            <div style={{ color: '#111827' }}>{form.customAlias || 'Auto-generated'}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Expires At</div>
                            <div style={{ color: '#111827' }}>{form.expiresAt || 'No expiration set'}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Metadata</div>
                            <div style={{ color: '#111827', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {form.metadata || 'No metadata provided'}
                            </div>
                        </div>
                    </div>

                    {result && (
                        <div
                            style={{
                                marginTop: 24,
                                paddingTop: 20,
                                borderTop: '1px solid #e5e7eb',
                            }}
                        >
                            <h3 style={{ marginTop: 0, color: '#111827' }}>Created Successfully</h3>
                            <div style={{ display: 'grid', gap: 10 }}>
                                <div>
                                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Alias</div>
                                    <div style={{ color: '#111827', fontWeight: 600 }}>{result.alias}</div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Short URL</div>
                                    <div style={{ color: '#2563eb', wordBreak: 'break-word' }}>{result.shortUrl}</div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Original URL</div>
                                    <div style={{ color: '#111827', wordBreak: 'break-word' }}>{result.longUrl}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}