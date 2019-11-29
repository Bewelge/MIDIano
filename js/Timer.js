class Timer {
    constructor() {
        this.currentTime = 0;
        this.startTime = window.performance.now() ;
        this.lastTime = this.startTime
        this.paused = true;

    }
    reset() {
        this.paused = true;
        this.currentTime = 0;
    }
    start() {
        this.startTime = window.performance.now() ;
        this.lastTime = this.startTime
    }
    getTime() {
        this.lastTime = window.performance.now() 
        return (this.lastTime - this.startTime) / 1000
    }
}