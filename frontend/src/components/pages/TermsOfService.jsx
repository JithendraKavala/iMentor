import React from 'react';
import PageLayout from '../layout/PageLayout';

const TermsOfService = ({ onLoginClick }) => {
    return (
        <PageLayout onLoginClick={onLoginClick}>
            <div className="container mx-auto px-4 max-w-3xl">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <div className="prose dark:prose-invert prose-lg">
                    <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the iMentor website and services operated by iMentor Inc.
                    </p>
                    <h3>1. Acceptance of Terms</h3>
                    <p>
                        By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
                    </p>
                    <h3>2. Academic Integrity</h3>
                    <p>
                        iMentor is designed to assist learning, not replace it. You agree not to use iMentor to generate content for submission as your own work without proper attribution or in violation of your institution's academic integrity policies.
                    </p>
                    <h3>3. Accounts</h3>
                    <p>
                        When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.
                    </p>
                    <h3>4. Intellectual Property</h3>
                    <p>
                        The Service and its original content, features and functionality are and will remain the exclusive property of iMentor Inc. and its licensors.
                    </p>
                    <h3>5. Termination</h3>
                    <p>
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
};

export default TermsOfService;
