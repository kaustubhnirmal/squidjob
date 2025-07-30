<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
    <title><?= isset($page_title) ? e($page_title) . ' - ' : '' ?><?= e($app_name) ?></title>
    
    <?php if (isset($meta_description)): ?>
    <meta name="description" content="<?= e($meta_description) ?>">
    <?php endif; ?>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="<?= asset('images/favicon.ico') ?>">
    
    <!-- CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="<?= asset('css/app.css') ?>" rel="stylesheet">
    
    <?php if (isset($css_files)): ?>
        <?php foreach ($css_files as $css): ?>
        <link href="<?= asset('css/' . $css) ?>" rel="stylesheet">
        <?php endforeach; ?>
    <?php endif; ?>
    
    <!-- CSRF Token -->
    <meta name="csrf-token" content="<?= $csrf_token ?>">
</head>
<body>
    <!-- Navigation -->
    <?php if (auth()): ?>
        <?php include APP_ROOT . '/app/views/partials/navbar-auth.php'; ?>
    <?php else: ?>
        <?php include APP_ROOT . '/app/views/partials/navbar-guest.php'; ?>
    <?php endif; ?>
    
    <!-- Flash Messages -->
    <?php if (!empty($flash)): ?>
        <div class="container mt-3">
            <?php foreach ($flash as $type => $message): ?>
                <?php if ($message): ?>
                <div class="alert alert-<?= $type === 'error' ? 'danger' : $type ?> alert-dismissible fade show" role="alert">
                    <?= e($message) ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    
    <!-- Breadcrumbs -->
    <?php if (isset($breadcrumbs) && !empty($breadcrumbs)): ?>
    <div class="container mt-3">
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <?php foreach ($breadcrumbs as $index => $breadcrumb): ?>
                    <?php if ($index === count($breadcrumbs) - 1): ?>
                        <li class="breadcrumb-item active" aria-current="page"><?= e($breadcrumb['title']) ?></li>
                    <?php else: ?>
                        <li class="breadcrumb-item">
                            <?php if ($breadcrumb['url']): ?>
                                <a href="<?= e($breadcrumb['url']) ?>"><?= e($breadcrumb['title']) ?></a>
                            <?php else: ?>
                                <?= e($breadcrumb['title']) ?>
                            <?php endif; ?>
                        </li>
                    <?php endif; ?>
                <?php endforeach; ?>
            </ol>
        </nav>
    </div>
    <?php endif; ?>
    
    <!-- Main Content -->
    <main class="main-content">
        <?= $content ?? '' ?>
    </main>
    
    <!-- Footer -->
    <?php include APP_ROOT . '/app/views/partials/footer.php'; ?>
    
    <!-- JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="<?= asset('js/app.js') ?>"></script>
    
    <?php if (isset($js_files)): ?>
        <?php foreach ($js_files as $js): ?>
        <script src="<?= asset('js/' . $js) ?>"></script>
        <?php endforeach; ?>
    <?php endif; ?>
    
    <!-- CSRF Token for AJAX -->
    <script>
        window.csrfToken = '<?= $csrf_token ?>';
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': window.csrfToken
            }
        });
    </script>
</body>
</html>