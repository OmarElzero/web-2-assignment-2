<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMovieRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $maxYear = (int) date('Y') + 2;

        return [
            'title' => ['required', 'string', 'max:255'],
            'imdb_id' => ['nullable', 'string', 'max:20'],
            'year' => ['nullable', 'integer', 'min:1888', 'max:' . $maxYear],
            'genre' => ['nullable', 'string', 'max:100'],
            'poster_path' => ['nullable', 'string', 'max:255'],
            'poster_url' => ['nullable', 'url', 'max:500'],
            'status' => ['required', Rule::in(['want_to_watch', 'watching', 'watched', 'dropped'])],
            'rating' => ['nullable', 'integer', 'between:1,10'],
            'user_id' => ['sometimes', 'integer', 'exists:users,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(array_map(function ($v) {
            return is_string($v) ? trim($v) : $v;
        }, $this->all()));
    }
}
