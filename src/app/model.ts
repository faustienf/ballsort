import { MouseEvent } from 'react';
import { action, atom, onUpdate } from '@reatom/framework';
import shuffle from 'lodash/shuffle';

export type BallColor = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

const COLORS_IN_GAME: number = 4;
const BALLS_IN_TUBE: number = 4;
const getCountOfTubes = (colors: number) => colors + 2; // magic

const isComplete = (tube: Tube): boolean => {
  if (tube.balls.length === BALLS_IN_TUBE) {
    const firstBall = tube.balls.at(0);
    return tube.balls.every((ball) => ball === firstBall);
  }
  return false;
};

export type Tube = {
  balls: BallColor[];
  over: BallColor | null;
  complete: boolean;
};

export const $state = atom<'start' | 'ingame' | 'won'>('start');
export const $isWon = atom((ctx) => ctx.spy($state) === 'won');
export const $moves = atom(0);
export const $tubes = atom<Tube[]>([]);
const $currentSelectedTubeIndex = atom<number | null>(null);

export const $field = atom((ctx) => {
  const currentIndex = ctx.spy($currentSelectedTubeIndex);
  return ctx.spy($tubes).map((tube, index) => {
    const isCurrent = currentIndex === index;
    const over = isCurrent ? tube.balls.at(0)! : null;
    const leftBalls = isCurrent ? tube.balls.slice(1) : tube.balls;
    return { balls: leftBalls, over, complete: isComplete(tube) };
  });
});

const $filledTubesCount = atom((ctx) => {
  return ctx.get($field).filter(({ complete }) => complete).length;
});

onUpdate($field, (ctx, field) => {
  console.log({ field });
});

onUpdate($filledTubesCount, (ctx, filledTubesCount) => {
  console.log({ filledTubesCount });
  if (filledTubesCount === COLORS_IN_GAME) {
    $state(ctx, 'won');
  }
});

const generateTubes = action((ctx, colorsCount: number) => {
  const tubesCount = getCountOfTubes(colorsCount);
  const availableBalls = shuffle(
    Array.from(
      { length: BALLS_IN_TUBE * colorsCount },
      (_, index) => (index % BALLS_IN_TUBE) as BallColor
    )
  );

  const filledTubes = Array.from(
    { length: colorsCount },
    (): Tube => ({
      balls: Array.from(
        { length: BALLS_IN_TUBE },
        () => availableBalls.pop() as BallColor
      ),
      over: null,
      complete: false,
    })
  );

  const emptyTubes = Array.from(
    { length: tubesCount - colorsCount },
    (): Tube => ({
      balls: [],
      over: null,
      complete: false,
    })
  );

  $tubes(ctx, [...filledTubes, ...emptyTubes]);
});

const ballMoved = action((ctx, nextIndex: number) => {
  const currentIndex = ctx.get($currentSelectedTubeIndex);
  const tubes = ctx.get($tubes);
  const sourceBall = tubes.at(currentIndex!)!.balls.at(0)!;

  if (currentIndex !== nextIndex) {
    $moves(ctx, (moves) => moves + 1);
  }

  $tubes(
    ctx,
    tubes
      .map((tube, index): Tube => {
        return index === currentIndex
          ? { ...tube, balls: tube.balls.slice(1) }
          : tube;
      })
      .map((tube, index): Tube => {
        return index === nextIndex
          ? { ...tube, balls: [sourceBall, ...tube.balls] }
          : tube;
      })
  );
});

export const tubeClicked = action((ctx, event: MouseEvent<HTMLDivElement>) => {
  const nextIndex = parseInt(event.currentTarget.dataset.position ?? '', 10);
  const currentIndex = ctx.get($currentSelectedTubeIndex);
  const tubes = ctx.get($tubes);
  const hasNotBalls = tubes[nextIndex].balls.length === 0;

  if (currentIndex === null) {
    if (hasNotBalls) {
      return;
    }

    $currentSelectedTubeIndex(ctx, nextIndex);
  } else {
    const sourceBall = tubes[currentIndex!].balls.at(0) ?? null;
    const targetBall = tubes[nextIndex].balls.at(0) ?? null;

    if (targetBall !== null && sourceBall !== targetBall) {
      return;
    }

    ballMoved(ctx, nextIndex);
    $currentSelectedTubeIndex(ctx, null);
  }
});

const resetGame = action((ctx) => {
  generateTubes(ctx, COLORS_IN_GAME);
  $moves(ctx, 0);
  $currentSelectedTubeIndex(ctx, null);
});

export const startClicked = action((ctx) => {
  $state(ctx, 'ingame');
  resetGame(ctx);
});
export const toMainMenuClicked = action((ctx) => {
  $state(ctx, 'start');
  resetGame(ctx);
});
export const restartClicked = action((ctx) => {
  resetGame(ctx);
});
