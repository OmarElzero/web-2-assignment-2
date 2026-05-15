<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMoviesTable extends Migration
{
    public function up()
    {
        Schema::create('movies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('imdb_id', 20)->nullable();
            $table->string('title', 255);
            $table->integer('year')->nullable();
            $table->string('genre', 100)->nullable();
            $table->string('poster_path', 255)->nullable();
            $table->string('poster_url', 500)->nullable();
            $table->enum('status', ['want_to_watch', 'watching', 'watched', 'dropped'])->default('want_to_watch');
            $table->unsignedTinyInteger('rating')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('movies');
    }
}
