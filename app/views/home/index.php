<?php
$content = capture(function() use ($stats, $features, $testimonials) {
?>

<!-- Hero Section -->
<section class="hero-section bg-primary text-white py-5">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                <h1 class="display-4 fw-bold mb-4">Streamline Your Tender Management</h1>
                <p class="lead mb-4">
                    SquidJob is a comprehensive tender management system that helps businesses 
                    efficiently manage their tender processes from start to finish.
                </p>
                <div class="d-flex gap-3">
                    <?php if (auth()): ?>
                        <a href="/dashboard" class="btn btn-light btn-lg">
                            <i class="fas fa-tachometer-alt me-2"></i>Go to Dashboard
                        </a>
                    <?php else: ?>
                        <a href="/login" class="btn btn-light btn-lg">
                            <i class="fas fa-sign-in-alt me-2"></i>Login
                        </a>
                        <a href="/register" class="btn btn-outline-light btn-lg">
                            <i class="fas fa-user-plus me-2"></i>Register
                        </a>
                    <?php endif; ?>
                </div>
            </div>
            <div class="col-lg-6">
                <img src="<?= asset('images/hero-illustration.svg') ?>" alt="Tender Management" class="img-fluid">
            </div>
        </div>
    </div>
</section>

<!-- Statistics Section -->
<section class="stats-section py-5 bg-light">
    <div class="container">
        <div class="row text-center">
            <div class="col-md-3 mb-4">
                <div class="stat-card">
                    <div class="stat-icon text-primary mb-3">
                        <i class="fas fa-file-alt fa-3x"></i>
                    </div>
                    <h3 class="stat-number"><?= number_format($stats['tenders']['total_tenders']) ?></h3>
                    <p class="stat-label">Total Tenders</p>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="stat-card">
                    <div class="stat-icon text-success mb-3">
                        <i class="fas fa-building fa-3x"></i>
                    </div>
                    <h3 class="stat-number"><?= number_format($stats['companies']['total_companies']) ?></h3>
                    <p class="stat-label">Registered Companies</p>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="stat-card">
                    <div class="stat-icon text-info mb-3">
                        <i class="fas fa-users fa-3x"></i>
                    </div>
                    <h3 class="stat-number"><?= number_format($stats['users']['active_users']) ?></h3>
                    <p class="stat-label">Active Users</p>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="stat-card">
                    <div class="stat-icon text-warning mb-3">
                        <i class="fas fa-chart-line fa-3x"></i>
                    </div>
                    <h3 class="stat-number"><?= number_format($stats['tenders']['completed_tenders']) ?></h3>
                    <p class="stat-label">Completed Tenders</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Features Section -->
<section class="features-section py-5">
    <div class="container">
        <div class="row">
            <div class="col-lg-8 mx-auto text-center mb-5">
                <h2 class="section-title">Powerful Features</h2>
                <p class="section-subtitle">
                    Everything you need to manage your tender processes efficiently and effectively.
                </p>
            </div>
        </div>
        <div class="row">
            <?php foreach ($features as $feature): ?>
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="feature-card h-100">
                    <div class="feature-icon text-primary mb-3">
                        <i class="fas fa-<?= e($feature['icon']) ?> fa-2x"></i>
                    </div>
                    <h5 class="feature-title"><?= e($feature['title']) ?></h5>
                    <p class="feature-description"><?= e($feature['description']) ?></p>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Testimonials Section -->
<section class="testimonials-section py-5 bg-light">
    <div class="container">
        <div class="row">
            <div class="col-lg-8 mx-auto text-center mb-5">
                <h2 class="section-title">What Our Clients Say</h2>
                <p class="section-subtitle">
                    Hear from businesses that have transformed their tender management with SquidJob.
                </p>
            </div>
        </div>
        <div class="row">
            <?php foreach ($testimonials as $testimonial): ?>
            <div class="col-lg-4 mb-4">
                <div class="testimonial-card h-100">
                    <div class="testimonial-content">
                        <div class="testimonial-rating mb-3">
                            <?php for ($i = 1; $i <= 5; $i++): ?>
                                <i class="fas fa-star <?= $i <= $testimonial['rating'] ? 'text-warning' : 'text-muted' ?>"></i>
                            <?php endfor; ?>
                        </div>
                        <p class="testimonial-message">"<?= e($testimonial['message']) ?>"</p>
                    </div>
                    <div class="testimonial-author">
                        <h6 class="author-name"><?= e($testimonial['name']) ?></h6>
                        <p class="author-position"><?= e($testimonial['position']) ?></p>
                        <p class="author-company text-muted"><?= e($testimonial['company']) ?></p>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="cta-section py-5 bg-primary text-white">
    <div class="container">
        <div class="row">
            <div class="col-lg-8 mx-auto text-center">
                <h2 class="cta-title mb-4">Ready to Transform Your Tender Management?</h2>
                <p class="cta-subtitle mb-4">
                    Join thousands of businesses that trust SquidJob for their tender management needs.
                </p>
                <?php if (!auth()): ?>
                <div class="d-flex justify-content-center gap-3">
                    <a href="/register" class="btn btn-light btn-lg">
                        <i class="fas fa-rocket me-2"></i>Get Started Free
                    </a>
                    <a href="/contact" class="btn btn-outline-light btn-lg">
                        <i class="fas fa-phone me-2"></i>Contact Sales
                    </a>
                </div>
                <?php else: ?>
                <a href="/dashboard" class="btn btn-light btn-lg">
                    <i class="fas fa-tachometer-alt me-2"></i>Go to Dashboard
                </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
</section>

<style>
.hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 500px;
    display: flex;
    align-items: center;
}

.stat-card {
    padding: 2rem 1rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-5px);
}

.stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #333;
}

.stat-label {
    color: #666;
    margin: 0;
}

.section-title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 1rem;
}

.section-subtitle {
    font-size: 1.1rem;
    color: #666;
    line-height: 1.6;
}

.feature-card {
    padding: 2rem 1.5rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
    text-align: center;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-title {
    color: #333;
    margin-bottom: 1rem;
}

.feature-description {
    color: #666;
    line-height: 1.6;
}

.testimonial-card {
    padding: 2rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.testimonial-message {
    font-style: italic;
    color: #555;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.author-name {
    color: #333;
    margin-bottom: 0.25rem;
}

.author-position {
    color: #666;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
}

.author-company {
    font-size: 0.85rem;
}

.cta-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.cta-title {
    font-size: 2.5rem;
    font-weight: bold;
}

.cta-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
}
</style>

<?php
});

// Include the layout
include APP_ROOT . '/app/views/layouts/app.php';
?>