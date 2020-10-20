import NOW from './Now';
import type { Tween } from './Tween';

/**
 * Controlling groups of tweens
 *
 * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
 * In these cases, you may want to create your own smaller groups of tween
 */
export default class Group
{
	private _tweens: {
		[key: string]: Tween<any>;
	} = {};

	private _tweensAddedDuringUpdate: {
		[key: string]: Tween<any>;
	} = {};

	getAll(): Array<Tween<any>>
	{
	    return Object.keys(this._tweens).map((tweenId) =>
	    this._tweens[tweenId]);
	}

	removeAll(): void
	{
	    this._tweens = {};
	}

	add(tween: Tween<any>): void
	{
	    this._tweens[tween.getId()] = tween;
	    this._tweensAddedDuringUpdate[tween.getId()] = tween;
	}

	remove(tween: Tween<any>): void
	{
	    delete this._tweens[tween.getId()];
	    delete this._tweensAddedDuringUpdate[tween.getId()];
	}

	update(time: number, preserve?: boolean): boolean
	{
	    let tweenIds = Object.keys(this._tweens);

	    if (tweenIds.length === 0)
	    {
	        return false;
	    }

	    time = time !== undefined ? time : NOW();

	    // Tweens are updated in "batches". If you add a new tween during an
	    // update, then the new tween will be updated in the next batch.
	    // If you remove a tween during an update, it may or may not be updated.
	    // However, if the removed tween was added during the current batch,
	    // then it will not be updated.
	    while (tweenIds.length > 0)
	    {
	        this._tweensAddedDuringUpdate = {};

	        for (let i = 0; i < tweenIds.length; i++)
	        {
	            const tween = this._tweens[tweenIds[i]];

	            if (tween && tween.update(time) === false && !preserve)
	            {
	                delete this._tweens[tweenIds[i]];
	            }
	        }

	        tweenIds = Object.keys(this._tweensAddedDuringUpdate);
	    }

	    return true;
	}
}
