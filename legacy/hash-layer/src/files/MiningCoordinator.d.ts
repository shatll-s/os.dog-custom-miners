/**
 * Координатор для синхронизации между несколькими GPU
 * Предотвращает конкуренцию при отправке блоков
 */
export declare class MiningCoordinator {
    private currentHeight;
    private isSubmitting;
    private submitLockQueue;
    /**
     * Проверить, можно ли продолжать майнить этот блок
     * height - это высота последнего блока в chain
     * Мы майним height + 1, поэтому проверяем height + 1 >= currentHeight
     */
    shouldContinueMining(height: bigint): boolean;
    /**
     * Получить эксклюзивное право на отправку транзакции
     * Только одна GPU может отправлять в момент времени
     */
    acquireSubmitLock(): Promise<void>;
    /**
     * Освободить lock после отправки
     */
    releaseSubmitLock(): void;
    /**
     * Уведомить что блок найден
     * Все GPU должны переключиться на следующий блок
     */
    notifyBlockFound(height: bigint): void;
    /**
     * Обновить текущую высоту если она изменилась в сети
     */
    updateHeight(height: bigint): void;
    /**
     * Получить текущую высоту
     */
    getCurrentHeight(): bigint;
}
//# sourceMappingURL=MiningCoordinator.d.ts.map