import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { CreatePage } from './create-page/create-page';
import { UpdatePage } from './update-page/update-page';
import { LoginPage } from './login/login';
import { SignupPage } from './signup/signup';
import { HowItWorksPage } from './how-it-works/how-it-works';
import { MissionPage } from './mission/mission';
import { PricingPage } from './pricing/pricing';
import { FaqPage } from './faq/faq';
import { NotFound } from './not-found/not-found';

export const routes: Routes = [
    { path: '', component: HomePage },
    { path: 'create-blog', component: CreatePage },
    { path: 'update-blog/:id', component: UpdatePage },
    { path: 'login', component: LoginPage },
    { path: 'signup', component: SignupPage },
    { path: 'how-it-works', component: HowItWorksPage },
    { path: 'mission', component: MissionPage },
    { path: 'pricing', component: PricingPage },
    { path: 'faq', component: FaqPage },
    { path: '**', component: NotFound }
];
