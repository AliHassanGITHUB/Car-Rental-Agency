<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about:rental', function (): void {
    $this->info('Aster Drive rental API');
});
