import React from 'react';
import PageLayout from '../layout/PageLayout';

const BlogPage = ({ onLoginClick }) => {
    const posts = [
        {
            title: "How AI is Reshaping Higher Education",
            excerpt: "From personalized curriculums to automated grading assistance, explore the future of learning.",
            date: "Oct 12, 2025",
            readTime: "5 min read",
            category: "EdTech"
        },
        {
            title: "Mastering the Art of Prompt Engineering for Research",
            excerpt: "Learn how to craft queries that yield deep, citation-backed academic insights.",
            date: "Oct 08, 2025",
            readTime: "8 min read",
            category: "Guides"
        },
        {
            title: "iMentor v2.0: Introducing the Knowledge Graph",
            excerpt: "Visualize connections between concepts with our newest feature update.",
            date: "Sep 28, 2025",
            readTime: "3 min read",
            category: "Product"
        }
    ];

    return (
        <PageLayout onLoginClick={onLoginClick}>
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-bold mb-12 text-center">Latest Insights</h1>

                <div className="space-y-12">
                    {posts.map((post, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{post.category}</span>
                                <span>•</span>
                                <span>{post.date}</span>
                                <span>•</span>
                                <span>{post.readTime}</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 group-hover:text-indigo-600 transition-colors">{post.title}</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                {post.excerpt}
                            </p>
                            <span className="text-indigo-600 font-medium hover:underline">Read more →</span>
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
};

export default BlogPage;
