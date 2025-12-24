<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ArticleController;

Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/latest', [ArticleController::class, 'latest']);
Route::post('/articles', [ArticleController::class, 'store']);
