import { untrack } from 'svelte';

export function createOneShot(condition: Function, callback: Function) {
    let hasFired = $state(false);

    $effect(() => {
        if (condition() && !hasFired) {
            untrack(() => callback());
            hasFired = true;
        }
    });

    return {
        get fired() { return hasFired; }
    };
}
