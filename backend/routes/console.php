<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('notifications:medication-reminders')
    ->everyMinute()
    ->withoutOverlapping();

Schedule::command('sanctum:prune-expired --hours=24')
    ->daily();
