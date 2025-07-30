</main>
    
    <!-- Footer -->
    <footer class="footer mt-5">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-6">
                    <p class="text-muted mb-0">
                        &copy; <?php echo date('Y'); ?> SquidJob Tender Management System. All rights reserved.
                    </p>
                </div>
                <div class="col-md-6 text-end">
                    <p class="text-muted mb-0">
                        Version 1.0.0 | 
                        <a href="<?php echo url('help'); ?>" class="text-decoration-none">Help</a> | 
                        <a href="<?php echo url('support'); ?>" class="text-decoration-none">Support</a>
                    </p>
                </div>
            </div>
        </div>
    </footer>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <!-- Additional JS files -->
    <?php if (isset($js_files)): ?>
        <?php foreach ($js_files as $js): ?>
            <script src="<?php echo url($js); ?>"></script>
        <?php endforeach; ?>
    <?php endif; ?>
    
    <!-- Global JavaScript -->
    <script>
        // CSRF Token for AJAX requests
        window.csrfToken = '<?php echo $csrf_token; ?>';
        
        // Set CSRF token for all AJAX requests
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': window.csrfToken
            }
        });
        
        // Auto-hide alerts after 5 seconds
        setTimeout(function() {
            $('.alert').fadeOut('slow');
        }, 5000);
        
        // Confirm delete actions
        $(document).on('click', '[data-confirm]', function(e) {
            if (!confirm($(this).data('confirm'))) {
                e.preventDefault();
                return false;
            }
        });
        
        // Loading state for forms
        $('form').on('submit', function() {
            $(this).find('button[type="submit"]').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Processing...');
        });
        
        // Tooltip initialization
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
        
        // Popover initialization
        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    </script>
    
    <style>
        .footer {
            background-color: white;
            border-top: 1px solid #e9ecef;
            padding: 20px 0;
            margin-top: auto;
        }
        
        .main-content {
            min-height: calc(100vh - 200px);
        }
        
        body {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        
        .alert {
            border: none;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .btn {
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .card {
            border: none;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            transition: all 0.2s ease;
        }
        
        .card:hover {
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }
        
        .dropdown-menu {
            border: none;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border-radius: 8px;
        }
        
        .dropdown-item:hover {
            background-color: var(--squidjob-light);
            color: var(--squidjob-primary);
        }
        
        .nav-link:hover {
            color: var(--squidjob-primary) !important;
        }
        
        .breadcrumb {
            background: none;
            padding: 0;
        }
        
        .breadcrumb-item + .breadcrumb-item::before {
            content: "›";
            color: #6c757d;
        }
        
        .breadcrumb-item a {
            color: var(--squidjob-primary);
            text-decoration: none;
        }
        
        .breadcrumb-item a:hover {
            text-decoration: underline;
        }
        
        /* Loading spinner */
        .fa-spin {
            animation: fa-spin 1s infinite linear;
        }
        
        @keyframes fa-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--squidjob-primary);
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #6d28d9;
        }
    </style>
</body>
</html>