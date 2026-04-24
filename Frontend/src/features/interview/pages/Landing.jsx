import React from 'react'
import { useNavigate } from 'react-router'
import '../style/landing.scss'

const Landing = () => {
    const navigate = useNavigate()

    return (
        <div className='landing-page'>

            {/* NAV */}
            <nav className='landing-nav'>
                <div className='landing-nav__logo'>
                    <svg width="35" height="35" viewBox="0 0 24 24" fill="#ff2d78" style={{marginRight: '-2px', flexShrink: 0}}>
                        <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956Z"/>
                    </svg>
                    Resume<em>Intelligence</em>
                </div>
                <div className='landing-nav__links'>
                    <a href='#how-it-works'>Features</a>
                    <a href='#process'>How it Works</a>
                </div>
                <div className='landing-nav__right'>
                    <button className='btn-login' onClick={() => navigate('/login')}>Login</button>
                    <button className='btn-signup' onClick={() => navigate('/register')}>Sign up</button>
                </div>
            </nav>

            {/* HERO */}
            <div className='hero-wrap'>
                <div className='hero-glow' />
                <div className='hero-glow-left' />
                <div className='hero'>
                    <div className='hero__left'>
                        <div className='hero-badge'>
                            <span className='hero-badge__dot' />
                            NLP-powered career intelligence
                        </div>
                        <h1>
                            Land Your Dream Job with{' '}
                            <em>Data-Driven</em> Insights.
                        </h1>
                        <p className='hero__desc'>
                            Analyse your resume against any job description using advanced NLP
                            to find skill gaps, get interview questions, and optimise your
                            profile — in seconds.
                        </p>
                        <button className='btn-cta' onClick={() => navigate('/register')}>
                            Get Started for Free
                        </button>
                    </div>

                    <div className='hero__right'>
                        <div className='preview-card'>
                            <div className='preview-card__bar'>
                                <span className='pdot pdot--red' />
                                <span className='pdot pdot--yellow' />
                                <span className='pdot pdot--green' />
                                <span className='preview-card__title'>
                                    ResumeIntelligence — Match Report
                                </span>
                            </div>
                            <div className='preview-card__body'>
                                <div className='score-row'>
                                    <div>
                                        <div className='score-num'>88<span>%</span></div>
                                        <div className='score-match'>Strong match for this role</div>
                                        <div className='score-role'>Backend Developer (Node.js)</div>
                                    </div>
                                    <div className='gen-time'>
                                        <div className='gen-label'>Generated in</div>
                                        <div className='gen-val'>0.9s</div>
                                    </div>
                                </div>
                                <div className='pbar'>
                                    <div className='pbar__top'><span>Technical skills</span><span>92%</span></div>
                                    <div className='pbar__track'><div className='pbar__fill pbar__fill--pink' style={{ width: '92%' }} /></div>
                                </div>
                                <div className='pbar'>
                                    <div className='pbar__top'><span>Keyword overlap</span><span>85%</span></div>
                                    <div className='pbar__track'><div className='pbar__fill pbar__fill--purple' style={{ width: '85%' }} /></div>
                                </div>
                                <div className='pbar'>
                                    <div className='pbar__top'><span>Experience depth</span><span>78%</span></div>
                                    <div className='pbar__track'><div className='pbar__fill pbar__fill--green' style={{ width: '78%' }} /></div>
                                </div>
                                <div className='preview-sep' />
                                <div className='gaps-label'>Skill gaps detected</div>
                                <div className='gap-tags'>
                                    <span className='gtag gtag--red'>PostgreSQL</span>
                                    <span className='gtag gtag--amber'>OAuth</span>
                                    <span className='gtag gtag--red'>Kubernetes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className='stats-row'>
                <div className='stats-row__item'>
                    <div className='stats-row__val'>5<em>s</em></div>
                    <div className='stats-row__lbl'>To get your full report</div>
                </div>
                <div className='stats-row__item'>
                    <div className='stats-row__val'>6<em>+</em></div>
                    <div className='stats-row__lbl'>Report sections</div>
                </div>
                <div className='stats-row__item'>
                    <div className='stats-row__val'>100<em>%</em></div>
                    <div className='stats-row__lbl'>Free to use</div>
                </div>
                <div className='stats-row__item'>
                    <div className='stats-row__val'><em>ATS</em></div>
                    <div className='stats-row__lbl'>Optimised resume</div>
                </div>
            </div>

            {/* HOW IT WORKS */}
            <section className='steps-section' id='how-it-works'>
                <div className='steps-section__eyebrow'>How it works</div>
                <div className='steps-section__title'>Follow just four steps to become interview-ready.</div>
                <div className='steps-grid'>
                    <div className='step-card'>
                        <div className='step-card__icon step-card__icon--pink'>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff2d78" strokeWidth="2.5">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </div>
                        <h3>Paste the JD</h3>
                        <p>Copy the full job description from any job board — LinkedIn, Naukri, Indeed — and paste it in.</p>
                    </div>
                    <div className='step-card'>
                        <div className='step-card__icon step-card__icon--purple'>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="12" y1="18" x2="12" y2="12" />
                                <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                        </div>
                        <h3>Upload Resume</h3>
                        <p>Upload a PDF resume or write a quick self-description if you don't have one ready.</p>
                    </div>
                    <div className='step-card'>
                        <div className='step-card__icon step-card__icon--green'>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <h3>Get Your Report</h3>
                        <p>Match score, skill gaps, interview questions and a preparation roadmap — instantly.</p>
                    </div>
                    <div className='step-card'>
                        <div className='step-card__icon step-card__icon--amber'>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </div>
                        <h3>Download Resume</h3>
                        <p>Get a tailored ATS-friendly resume optimised for the role, ready to apply.</p>
                    </div>
                </div>
            </section>

            {/* FROM SUBMISSION TO SHORTLIST */}
            <section className='process-section' id='process'>
                <div className='process-section__eyebrow'>From Submission to Shortlist</div>
                <div className='process-section__title'>How ResumeIntelligence works under the hood.</div>
                <div className='process-card'>
                    <div className='process-card__header'>Your report breakdown</div>
                    <div className='process-row'>
                        <div className='process-row__num'>1</div>
                        <div>
                            <h4>Match Score</h4>
                            <p>TF-IDF + cosine similarity compares your resume against the JD for a precise percentage.</p>
                        </div>
                    </div>
                    <div className='process-row'>
                        <div className='process-row__num'>2</div>
                        <div>
                            <h4>Skill Gap Detection</h4>
                            <p>NLP keyword extraction identifies skills required by the role missing from your profile.</p>
                        </div>
                    </div>
                    <div className='process-row'>
                        <div className='process-row__num'>3</div>
                        <div>
                            <h4>Interview Strategy</h4>
                            <p>Questions and roadmap generated based on your matched skills and identified gaps.</p>
                        </div>
                    </div>
                    <div className='process-row'>
                        <div className='process-row__num'>4</div>
                        <div>
                            <h4>Resume Download</h4>
                            <p>Your parsed profile structured and exported as an ATS-ready PDF for the role.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* BOTTOM CTA */}
            <section className='cta-section'>
                <div className='cta-section__box'>
                    <div className='cta-section__glow' />
                    <h2>Ready to walk in fully prepared?</h2>
                    <p>No subscriptions. Just results.</p>
                    <button className='btn-cta' onClick={() => navigate('/register')}>
                        Get Started for Free
                    </button>
                </div>
            </section>

            {/* FOOTER */}
            <footer className='landing-footer'>
                <div className='landing-footer__logo'>Resume<em>Intelligence</em></div>
                <div className='landing-footer__copy'>© 2026 ResumeIntelligence. Built with NLP.</div>
                <div className='landing-footer__links'>
                    <a href='#'>Privacy Policy</a>
                    <a href='#'>Terms of Service</a>
                    <a href='#'>Contact Support</a>
                </div>
            </footer>

        </div>
    )
}

export default Landing