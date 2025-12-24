<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    /**
     * GET /api/articles
     * List all articles (latest first)
     */
    public function index()
    {
        return response()->json(
            Article::orderBy('created_at', 'desc')->get()
        );
    }

    /**
     * GET /api/articles/latest
     * Fetch latest article
     */
    public function latest()
    {
        $article = Article::orderBy('created_at', 'desc')->first();

        if (!$article) {
            return response()->json([
                'message' => 'No articles found'
            ], 404);
        }

        return response()->json($article);
    }

    /**
     * POST /api/articles
     * Create new article (used by Node worker)
     */
    public function store(Request $request)
    {
        $article = Article::create([
            'title'       => $request->title,
            'content'     => $request->content,
            'source_url'  => $request->source_url ?? null,
            'is_updated'  => $request->is_updated ?? false,
            'references'  => $request->references ?? null,
        ]);

        return response()->json($article, 201);
    }
}
