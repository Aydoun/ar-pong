import React, {useState} from 'react';
import {ViroMaterials, ViroBox} from 'react-viro';
import firestore from '@react-native-firebase/firestore';

import PuckMaster from './PuckMaster';
import PuckSlave from './PuckSlave';
import Paddle from './Paddle';
import MasterContext from '../Context/MasterContext';

const NUMBER_OF_DECIMALS = 3;

const getFloat = value => {
  return parseFloat(value.toFixed(NUMBER_OF_DECIMALS));
};

const onPinch = (pinchState, scaleFactor, source, scale, setScale) => {
  setScale(scale * scaleFactor);
};

const Playground = props => {
  const {length, paddleAX, paddleAZ, paddleBX, paddleBZ, puckX, puckZ} = props;
  const [scale, setScale] = useState(1);

  const masterContext = React.useContext(MasterContext);

  const onColide = React.useCallback(async master => {
    if (master) {
      const score = await firestore
        .collection('score')
        .doc('master')
        .get();
      await firestore()
        .collection('score')
        .doc('master')
        .set(score + 1);
    } else {
      const score = await firestore
        .collection('score')
        .doc('master')
        .get();
      await firestore()
        .collection('score')
        .doc('slave')
        .set(score + 1);
    }
  });

  const width = getFloat(length * 2);
  const height = getFloat(width / 100);

  const borders = [
    {
      key: 'borderA',
      width,
      length: getFloat(height * 2),
      height: getFloat(height * 4),
      positionX: 0,
      positionY: getFloat(height * 1.5),
      positionZ: getFloat(length / 2 + height),
    },
    {
      key: 'borderB',
      width,
      length: getFloat(height * 2),
      height: getFloat(height * 4),
      positionX: 0,
      positionY: getFloat(height * 1.5),
      positionZ: -getFloat(length / 2 + height),
    },
    {
      key: 'borderC',
      width: getFloat(height * 2),
      length: getFloat(length),
      height: getFloat(height * 4),
      positionX: -getFloat(width / 2 + height),
      positionY: getFloat(height * 1.5),
      positionZ: 0,
    },
    {
      key: 'borderD',
      width: getFloat(height * 2),
      length: getFloat(length),
      height: getFloat(height * 4),
      positionX: getFloat(width / 2 + height),
      positionY: getFloat(height * 1.5),
      positionZ: 0,
    },
  ];

  const bordersRender = borders.map(border => {
    const {
      key,
      positionX,
      positionY,
      positionZ,
      height,
      width,
      length,
    } = border;

    let _onColide = null;
    if (key === 'borderC') {
      _onColide = () => onColide(true);
    }
    if (key === 'borderD') {
      _onColide = () => onColide(false);
    }

    return (
      <ViroBox
        key={key}
        position={[positionX, positionY, positionZ]}
        height={height}
        length={length}
        width={width}
        scale={[scale, scale, scale]}
        materials={['whiteFilled']}
        onCollision={_onColide}
        physicsBody={{
          type: 'Static',
          mass: 0,
          friction: 0,
          shape: {
            type: 'Box',
            params: [width, height, length],
          },
          enable: true,
        }}
      />
    );
  });

  return (
    <>
      <ViroBox
        key={'base'}
        position={[0, 0, 0]}
        height={height}
        length={length}
        width={width}
        // scale={[scale, scale, scale]}
        materials={['white']}
        // onPinch={() => onPinch(scale, setScale)}
        physicsBody={{
          type: 'Static',
          mass: 0,
          friction: 0.01,
          shape: {
            type: 'Box',
            params: [width, height, length],
          },
        }}
      />
      {bordersRender}
      <Paddle
        key={'paddleA'}
        positionX={getFloat(width / 2 - 0.05)}
        positionY={height + 0.01}
        positionZ={paddleAZ}
        scaleFactor={scale}
        maxZ={getFloat(length / 2)}
      />
      <Paddle
        key={'paddleB'}
        positionX={getFloat(-width / 2 + 0.05)}
        positionY={height + 0.01}
        positionZ={paddleBZ}
        scaleFactor={scale}
        maxZ={getFloat(length / 2)}
      />
      {masterContext.isMaster && (
        <PuckMaster
          key={'puckMaster'}
          positionX={puckX}
          positionY={height + 0.005}
          positionZ={puckZ}
          scaleFactor={scale}
        />
      )}
      {!masterContext.isMaster && (
        <PuckSlave
          key={'puckSlave'}
          positionX={puckX}
          positionY={height + 0.01}
          positionZ={puckZ}
          scaleFactor={scale}
        />
      )}
    </>
  );
};

ViroMaterials.createMaterials({
  white: {
    lightingModel: 'PBR',
    diffuseColor: 'rgb(231,231,231)',
    blendMode: 'Add',
  },
  whiteFilled: {
    lightingModel: 'PBR',
    diffuseColor: 'rgb(231,231,231)',
  },
});

export default Playground;