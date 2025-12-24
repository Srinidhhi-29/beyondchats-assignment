<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use GuzzleHttp\Client;
use App\Models\Article;

class ScrapeBeyondChats extends Command
{
    protected $signature = 'scrape:beyondchats';
    protected $description = 'Scrape 5 oldest BeyondChats blog articles';

    public function handle()
    {
        $client = new Client();
        $html = $client->get('https://beyondchats.com/blogs/')->getBody();

        preg_match_all('/<a href="(https:\/\/beyondchats.com\/blogs\/[^"]+)"/', $html, $matches);
        $links = array_slice(array_unique($matches[1]), -5);

        foreach ($links as $link) {
            $page = $client->get($link)->getBody();

            preg_match('/<h1.*?>(.*?)<\/h1>/', $page, $title);
            preg_match('/<article.*?>(.*?)<\/article>/s', $page, $content);

            Article::create([
                'title' => strip_tags($title[1] ?? 'Untitled'),
                'content' => strip_tags($content[1] ?? ''),
                'source_url' => $link
            ]);
        }

        $this->info('BeyondChats articles scraped successfully.');
    }
}
