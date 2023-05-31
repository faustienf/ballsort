import React, { ComponentProps, FC, PropsWithChildren } from 'react';
import { useAction, useAtom } from '@reatom/npm-react';
import styled from 'styled-components';
import {
  $field,
  $isWon,
  $moves,
  $state,
  BallColor,
  restartClicked,
  startClicked,
  toMainMenuClicked,
  tubeClicked,
} from './model';

import './index.css';

const colors: Record<BallColor, [string, string]> = {
  0x0: ['#8F7E22', '#FFE600'],
  0x1: ['#247516', '#70FF00'],
  0x2: ['#466799', '#00B2FF'],
  0x3: ['#29777C', '#00FFF0'],
  0x4: ['#17206F', '#4A72FF'],
  0x5: ['#BABABA', '#FFFFFF'],
  0x6: ['#4C3283', '#9D50FF'],
  0x7: ['#8B11C5', '#FF00F5'],
  0x8: ['#9D0D41', '#FF60B5'],
  0x9: ['#4B0000', '#FF0000'],
  0xa: ['#79480F', '#FF7A00'],
  0xb: ['#343434', '#B1B1B1'],
};

const BallComponent: FC<
  PropsWithChildren<{ ball: BallColor; className?: string }>
> = ({ className, children, ball }) => (
  <div
    className={className}
    style={
      {
        '--main-color': colors[ball][0],
        '--light-color': colors[ball][1],
      } as React.CSSProperties
    }
    data-number={ball}
  >
    {children}
  </div>
);

const MovesContent: FC<{ className?: string }> = ({ className }) => {
  const [count] = useAtom($moves);

  return <span className={className}>Moves: {count}</span>;
};

const Content = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  align-content: center;
  justify-content: center;
`;

const Title = styled.h2`
  font-size: 3rem;
  font-weight: 300;

  & span {
    text-decoration: underline;
  }
`;

const buttonMap = ({
  selected,
  text,
}: {
  selected?: boolean;
  text: React.ReactNode;
}) => ({
  'data-selected': selected ?? false,
  type: 'button',
  children: text,
});

const Button = styled.button.attrs(buttonMap)`
  background-color: white;
  color: black;
  padding: 0.6rem 1rem;
  font-size: 1.3rem;
  margin: 0 0.2rem;
  border: 2px solid lightgray;
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: #f1f1f1;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 4px lightblue;
    border-color: lightblue;
  }

  &[data-selected='true'] {
    border-color: gray;
    background-color: gray;
    color: white;
  }
`;

const Moves = styled(MovesContent)`
  padding: 0.6rem 0.4rem;
  font-size: 1.3rem;
  margin: 0;
`;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 38rem;
`;

const Won = styled.div`
  display: flex;
  flex-flow: column;
  position: fixed;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);
  align-items: center;
  padding-top: 5rem;

  h1,
  h2,
  h3 {
    color: black;
    text-shadow: 0 0 2px white;
  }

  & > * + * {
    margin-top: 1rem;
  }
`;

const TubeHolder = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const TubeTop = styled.div`
  display: flex;
  height: 3rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 4px solid lightgray;
`;

const TubeGlass = styled.div<{ 'data-complete': boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex-shrink: 0;
  align-items: center;
  border: 2px solid lightgray;
  border-top: none;
  width: 3rem;
  height: 10rem;
  padding-bottom: 0.4rem;
  padding-top: 0.4rem;
  border-bottom-left-radius: 2.4rem;
  border-bottom-right-radius: 2.4rem;

  &[data-complete='true'] {
    background-color: lightgray;
  }
`;

const Ball = styled(BallComponent)`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid black;
  margin: 1px;
  flex-shrink: 0;
  background: radial-gradient(
    circle at 65% 15%,
    white 1px,
    var(--light-color) 3%,
    var(--main-color) 60%,
    var(--light-color) 100%
  );
  position: relative;

  &::after {
    content: '' attr(data-number) '';
    position: absolute;
    top: 6px;
    left: 10px;
    color: white;
    text-shadow: 0 0 1px black;
    display: none;
  }
`;

type TubeProps = {
  tube: {
    balls: Array<BallColor>;
    over: BallColor | null;
    complete: boolean;
  };
  position: number;
  onClick: ComponentProps<'div'>['onClick'];
};

const Tube: FC<TubeProps> = ({ tube, position, onClick }) => (
  <TubeHolder onClick={onClick} data-position={position}>
    <TubeTop>{tube.over !== null ? <Ball ball={tube.over} /> : null}</TubeTop>
    <TubeGlass data-complete={tube.complete}>
      {tube.balls.map((color, index) => (
        <Ball key={index} ball={color} />
      ))}
    </TubeGlass>
  </TubeHolder>
);

const WonScreen = () => {
  const [moves] = useAtom($moves);
  const handleCLick = useAction(toMainMenuClicked);

  return (
    <Won>
      <h1>You won!</h1>
      <h2>In {moves} moves</h2>
      <Button onClick={handleCLick} text="New game" />
    </Won>
  );
};

const StartScreen = () => {
  const handleClick = useAction(startClicked);
  return (
    <Content>
      <Title>
        <span>BALL</span>SORT
      </Title>
      <Button onClick={handleClick} text="Start game" />
    </Content>
  );
};

export const InPlay = () => {
  const [isWon] = useAtom($isWon);
  const [tubes] = useAtom($field);
  const handleClick = useAction(tubeClicked);
  const handleRestart = useAction(restartClicked);
  const handleMainMenuClicked = useAction(toMainMenuClicked);

  return (
    <>
      <div>
        <Button onClick={handleMainMenuClicked} text="←" />
        <Button onClick={handleRestart} text="Restart" />
        <Moves />
      </div>
      <Container>
        {tubes.map((tube, idx) => (
          <Tube
            key={idx}
            tube={{
              balls: tube.balls,
              over: tube.over,
              complete: tube.complete,
            }}
            position={idx}
            onClick={handleClick}
          />
        ))}
      </Container>
      {isWon && <WonScreen />}
    </>
  );
};

export const App = () => {
  const [state] = useAtom($state);

  if (state === 'start') {
    return <StartScreen />;
  }

  return <InPlay />;
};
