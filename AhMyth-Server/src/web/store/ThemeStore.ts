import { makeAutoObservable } from 'mobx';

export class ThemeStore {
    public theme: 'light' | 'dark';

    constructor() {
        this.theme = 'light';

        makeAutoObservable(this);
    }

    public toggleTheme(): void {
        this.theme = this.theme === 'light' ? 'dark' : 'light';

        localStorage.setItem('theme', this.theme);
    }
}
