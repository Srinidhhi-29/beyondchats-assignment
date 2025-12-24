<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    /**
     * GET /api/articles
     * Fetch all articles (original + updated)
     */
    public function index()
    {
        return Article::orderBy('created_at', 'desc')->get();
    }

    /**
     * GET /api/articles/latest
     * Fetch ONLY an article that has NOT been updated yet
     * (Prevents infinite "(Updated)" loop)
     */
    public function latest()
    {
        $article = Article::whereNull('updated_content')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$article) {
            return response()->json([
                'message' => 'No pending articles to update'
            ], 404);
        }

        return response()->json($article);
    }

    /**
     * POST /api/articles
     * Create article (original OR updated)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'           => 'required|string',
            'content'         => 'nullable|string',
            'updated_content' => 'nullable|string',
            'source_url'      => 'nullable|string',
            'references'      => 'nullable|string',
        ]);

        // Prevent duplicate updated titles
        if (
            isset($validated['updated_content']) &&
            Article::where('title', $validated['title'])->exists()
        ) {
            return response()->json([
                'message' => 'Updated article already exists'
            ], 409);
        }

        $article = Article::create($validated);

        return response()->json($article, 201);
    }
}
