/**
 * JJK Manga Blog System
 * Fetches and displays blog posts from posts.json manifest
 */

class BlogManager {
    constructor() {
        this.posts = [];
        this.postsPerPage = 6;
        this.currentPage = 1;
        this.currentCategory = 'all';
        this.basePath = 'blog/';
    }

    /**
     * Initialize the blog system
     */
    async init() {
        await this.loadPosts();
        this.renderCategories();
        this.renderPosts();
        this.setupEventListeners();
    }

    /**
     * Load posts from the JSON manifest
     */
    async loadPosts() {
        try {
            const response = await fetch(this.basePath + 'posts.json');
            if (!response.ok) {
                throw new Error('Failed to load posts');
            }
            const data = await response.json();
            this.posts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error loading blog posts:', error);
            this.posts = [];
        }
    }

    /**
     * Get unique categories from all posts
     */
    getCategories() {
        const categories = new Set(this.posts.map(post => post.category));
        return ['all', ...Array.from(categories)];
    }

    /**
     * Filter posts by category
     */
    getFilteredPosts() {
        if (this.currentCategory === 'all') {
            return this.posts;
        }
        return this.posts.filter(post => post.category === this.currentCategory);
    }

    /**
     * Get paginated posts
     */
    getPaginatedPosts() {
        const filtered = this.getFilteredPosts();
        const start = (this.currentPage - 1) * this.postsPerPage;
        const end = start + this.postsPerPage;
        return filtered.slice(start, end);
    }

    /**
     * Get total pages
     */
    getTotalPages() {
        return Math.ceil(this.getFilteredPosts().length / this.postsPerPage);
    }

    /**
     * Render category filters
     */
    renderCategories() {
        const container = document.getElementById('blog-categories');
        if (!container) return;

        const categories = this.getCategories();
        container.innerHTML = categories.map(category => `
            <button class="category-btn ${category === this.currentCategory ? 'active' : ''}" 
                    data-category="${category}">
                ${category === 'all' ? 'All Posts' : category}
            </button>
        `).join('');
    }

    /**
     * Render blog posts grid
     */
    renderPosts() {
        const container = document.getElementById('blog-posts');
        if (!container) return;

        const posts = this.getPaginatedPosts();

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="no-posts">
                    <p>No blog posts found in this category.</p>
                </div>
            `;
            this.renderPagination();
            return;
        }

        container.innerHTML = posts.map(post => this.renderPostCard(post)).join('');
        this.renderPagination();
    }

    /**
     * Render individual post card
     */
    renderPostCard(post) {
        const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <article class="blog-card">
                <div class="blog-card-content">
                    <span class="blog-category">${post.category}</span>
                    <h3 class="blog-card-title">
                        <a href="${this.basePath}${post.slug}">${post.title}</a>
                    </h3>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    <div class="blog-card-meta">
                        <span class="blog-author">By ${post.author}</span>
                        <span class="blog-date">${formattedDate}</span>
                    </div>
                    <div class="blog-card-tags">
                        ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                    </div>
                    <a href="${this.basePath}${post.slug}" class="read-more-btn">Read More →</a>
                </div>
            </article>
        `;
    }

    /**
     * Render pagination controls
     */
    renderPagination() {
        const container = document.getElementById('blog-pagination');
        if (!container) return;

        const totalPages = this.getTotalPages();
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    data-page="${this.currentPage - 1}" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                ← Previous
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <button class="pagination-btn page-num ${i === this.currentPage ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Next button
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    data-page="${this.currentPage + 1}"
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                Next →
            </button>
        `;

        container.innerHTML = paginationHTML;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Category filter clicks
        document.getElementById('blog-categories')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                this.currentCategory = e.target.dataset.category;
                this.currentPage = 1;
                this.renderCategories();
                this.renderPosts();
            }
        });

        // Pagination clicks
        document.getElementById('blog-pagination')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('pagination-btn') && !e.target.disabled) {
                this.currentPage = parseInt(e.target.dataset.page);
                this.renderPosts();
                // Scroll to top of posts
                document.getElementById('blog-posts')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    /**
     * Get featured posts
     */
    getFeaturedPosts() {
        return this.posts.filter(post => post.featured).slice(0, 3);
    }

    /**
     * Get recent posts
     */
    getRecentPosts(count = 5) {
        return this.posts.slice(0, count);
    }

    /**
     * Search posts
     */
    searchPosts(query) {
        const searchTerm = query.toLowerCase();
        return this.posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
}

// Initialize blog when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const blogManager = new BlogManager();
    blogManager.init();
});

// Export for use in other scripts
window.BlogManager = BlogManager;
