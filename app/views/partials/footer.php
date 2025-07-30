<footer class="bg-dark text-light py-4 mt-5">
    <div class="container">
        <div class="row">
            <div class="col-md-4">
                <h5><i class="fas fa-briefcase me-2"></i>SquidJob</h5>
                <p class="text-muted">Your trusted platform for job opportunities and tender management.</p>
                <div class="social-links">
                    <a href="#" class="text-light me-3"><i class="fab fa-facebook"></i></a>
                    <a href="#" class="text-light me-3"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="text-light me-3"><i class="fab fa-linkedin"></i></a>
                    <a href="#" class="text-light"><i class="fab fa-instagram"></i></a>
                </div>
            </div>
            
            <div class="col-md-2">
                <h6>Quick Links</h6>
                <ul class="list-unstyled">
                    <li><a href="<?= url('/') ?>" class="text-muted">Home</a></li>
                    <li><a href="<?= url('/jobs') ?>" class="text-muted">Jobs</a></li>
                    <li><a href="<?= url('/tenders') ?>" class="text-muted">Tenders</a></li>
                    <li><a href="<?= url('/about') ?>" class="text-muted">About</a></li>
                </ul>
            </div>
            
            <div class="col-md-2">
                <h6>Services</h6>
                <ul class="list-unstyled">
                    <li><a href="<?= url('/tenders/create') ?>" class="text-muted">Post Tender</a></li>
                    <li><a href="<?= url('/jobs/create') ?>" class="text-muted">Post Job</a></li>
                    <li><a href="<?= url('/bids') ?>" class="text-muted">Bid Management</a></li>
                    <li><a href="<?= url('/support') ?>" class="text-muted">Support</a></li>
                </ul>
            </div>
            
            <div class="col-md-2">
                <h6>Legal</h6>
                <ul class="list-unstyled">
                    <li><a href="<?= url('/privacy') ?>" class="text-muted">Privacy Policy</a></li>
                    <li><a href="<?= url('/terms') ?>" class="text-muted">Terms of Service</a></li>
                    <li><a href="<?= url('/cookies') ?>" class="text-muted">Cookie Policy</a></li>
                    <li><a href="<?= url('/disclaimer') ?>" class="text-muted">Disclaimer</a></li>
                </ul>
            </div>
            
            <div class="col-md-2">
                <h6>Contact</h6>
                <ul class="list-unstyled text-muted">
                    <li><i class="fas fa-envelope me-2"></i>info@squidjob.com</li>
                    <li><i class="fas fa-phone me-2"></i>+1 (555) 123-4567</li>
                    <li><i class="fas fa-map-marker-alt me-2"></i>123 Business St</li>
                </ul>
            </div>
        </div>
        
        <hr class="my-4">
        
        <div class="row align-items-center">
            <div class="col-md-6">
                <p class="mb-0 text-muted">&copy; <?= date('Y') ?> SquidJob. All rights reserved.</p>
            </div>
            <div class="col-md-6 text-md-end">
                <p class="mb-0 text-muted">
                    <small>Powered by SquidJob Platform v1.0</small>
                </p>
            </div>
        </div>
    </div>
</footer>