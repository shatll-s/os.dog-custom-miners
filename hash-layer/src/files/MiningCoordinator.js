/**
 * Координатор для синхронизации между несколькими GPU
 * Предотвращает конкуренцию при отправке блоков
 */
export class MiningCoordinator {
    currentHeight = 0n;
    isSubmitting = false;
    submitLockQueue = [];
    /**
     * Проверить, можно ли продолжать майнить этот блок
     * height - это высота последнего блока в chain
     * Мы майним height + 1, поэтому проверяем height + 1 >= currentHeight
     */
    shouldContinueMining(height) {
        if (this.currentHeight === 0n) {
            this.currentHeight = height + 1n;
            return true;
        }
        // Если высота изменилась (кто-то нашел блок), нужно переключиться
        // Проверяем height + 1 потому что мы майним следующий блок
        return height + 1n >= this.currentHeight;
    }
    /**
     * Получить эксклюзивное право на отправку транзакции
     * Только одна GPU может отправлять в момент времени
     */
    async acquireSubmitLock() {
        if (!this.isSubmitting) {
            this.isSubmitting = true;
            return;
        }
        // Ждем в очереди
        return new Promise((resolve) => {
            this.submitLockQueue.push(resolve);
        });
    }
    /**
     * Освободить lock после отправки
     */
    releaseSubmitLock() {
        const next = this.submitLockQueue.shift();
        if (next) {
            next();
        }
        else {
            this.isSubmitting = false;
        }
    }
    /**
     * Уведомить что блок найден
     * Все GPU должны переключиться на следующий блок
     */
    notifyBlockFound(height) {
        if (height > this.currentHeight) {
            console.log(`[COORD] Block ${height} found, switching all GPUs to ${height + 1n}`);
            this.currentHeight = height;
        }
    }
    /**
     * Обновить текущую высоту если она изменилась в сети
     */
    updateHeight(height) {
        if (height > this.currentHeight) {
            this.currentHeight = height;
        }
    }
    /**
     * Получить текущую высоту
     */
    getCurrentHeight() {
        return this.currentHeight;
    }
}
//# sourceMappingURL=MiningCoordinator.js.map