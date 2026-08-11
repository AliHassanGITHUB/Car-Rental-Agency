<?php

namespace App\Providers;

use App\Services\Payment\PaymentGatewayInterface;
use App\Services\Payment\StripeGateway;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, function () {
            return new StripeGateway();
        });
    }

    public function boot(): void
    {
        //
    }
}
