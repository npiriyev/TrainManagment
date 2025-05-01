import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'',
        loadComponent: () =>{
            return import('./home/home.component').then((m)=>m.HomeComponent);
        }
    },
    {
    path:'table',
    loadComponent: () =>{
        return import('./listview/listview.component').then((m)=>m.ListviewComponent);
    }
},
];
