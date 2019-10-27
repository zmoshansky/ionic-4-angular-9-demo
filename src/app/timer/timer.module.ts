import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TimerComponent } from './timer.component';

@NgModule({
    imports: [
        CommonModule,
        IonicModule
    ]
    , declarations: [TimerComponent]
    , exports: [TimerComponent]
})
export class TimerComponentModule {}
