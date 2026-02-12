<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Subscription;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;
use App\Mail\SubscriptionMail;

class SubscriptionController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email',
            'plan' => 'required|string',
        ]);

        // Save Subscription
        $subscription = Subscription::create([
            'name' => $request->name,
            'email' => $request->email,
            'plan' => $request->plan,
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'plan' => $request->plan,
        ];

        // Send Welcome Email
        // Send Subscription Email
        Mail::to($request->email)->send(new SubscriptionMail($data));

        return response()->json([
            'status' => true,
            'message' => 'Subscription created and emails sent successfully!',
            'data' => $subscription
        ]);
    }
}
