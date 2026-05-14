<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMovieRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $maxYear = (int) date('Y') + 2;

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'imdb_id' => ['sometimes', 'nullable', 'string', 'max:20'],
            'year' => ['sometimes', 'nullable', 'integer', 'min:1888', 'max:' . $maxYear],
            'genre' => ['sometimes', 'nullable', 'string', 'max:100'],
            'poster_path' => ['sometimes', 'nullable', 'string', 'max:255'],
            'poster_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'status' => ['sometimes', Rule::in(['want_to_watch', 'watching', 'watched', 'dropped'])],
            'rating' => ['sometimes', 'nullable', 'integer', 'between:1,10'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(array_map(function ($v) {
            return is_string($v) ? trim($v) : $v;
        }, $this->all()));
    }
}
