import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Subject, interval, NEVER } from 'rxjs';
import { map, switchMap, distinctUntilChanged, scan } from 'rxjs/operators';
import * as R from 'ramda';

const MillisecondsPerSecond = 1000;
const MillisecondsPerMinute = MillisecondsPerSecond * 60;
const defaultTimer = 25 * MillisecondsPerMinute;

type Option<T> = T | void;

function toMinutes(milliseconds: number): number {
  return Math.floor(milliseconds / MillisecondsPerMinute);
}

function toSeconds(milliseconds: number): number {
  return Math.floor(milliseconds % MillisecondsPerMinute / MillisecondsPerSecond);
}

function toMilliseconds(milliseconds: number): number {
  return Math.floor(milliseconds % MillisecondsPerSecond /10);
}

function toClockStrings(value: number): string {
  return value.toString().padStart(2, '0');
}

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // encapsulation: ViewEncapsulation.ShadowDom,
})
export class TimerComponent implements OnInit {
  private timeRemaining = new BehaviorSubject(defaultTimer);
  private running = new BehaviorSubject(false);

  public minutes = this.timeRemaining.pipe(
    map(toMinutes),
    map(toClockStrings),
  );

  public seconds = this.timeRemaining.pipe(
    map(toSeconds),
    map(toClockStrings),
  );

  public milliseconds = this.timeRemaining.pipe(
    map(toMilliseconds),
    map(toClockStrings),
  );

  public startPauseText = this.running.pipe(
    map((state: boolean) => {
      if (!state) {
        return 'Start';
      } else {
        return 'Pause';
      }
    })
  );

  public reset() {
    this.timeRemaining.next(defaultTimer);
    this.running.next(undefined);
  }

  public start() {
    this.running.next(!this.running.value);
  }
  
  public ngOnInit() {
    this.running.pipe(
      distinctUntilChanged(),
      switchMap((remaining: boolean) => {
        if (remaining) { 
          return interval(100).pipe(
            scan((acc: number[]) => {
              const now = performance.now();
              return [now, now - acc[0]];
            }, [performance.now(), 0])
          )
        } else {
          return NEVER;
        }
      })
    ).subscribe((elapsed: number[]) => {
      if (this.timeRemaining.value < elapsed[1]) {
        this.complete();
      } else {
        this.timeRemaining.next(this.timeRemaining.value - elapsed[1]);
      }
    })
  }

  private complete() {
    console.log('timer completed');
    // Show desktop notification
    this.reset();
  }

}
