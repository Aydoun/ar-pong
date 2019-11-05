import React from 'react';
import firestore from '@react-native-firebase/firestore';
import {Viro3DObject} from 'react-viro';
import LocalCoordinates from '../Context/LocalCoordinatesContext';
const packModel = require('../res/D7-AirHockeyPuck.obj');

const Puck = React.memo(() => {
  const puckRef = React.useRef();
  const localCoordinates = React.useContext(LocalCoordinates);
  const [isEnabled, setIsEnabled] = React.useState(false);

  const setPuckPosition = async e => {
    const {x, y, z} = e;
    await firestore()
      .collection('puck')
      .doc('position')
      .set({
        x,
        y,
        z,
      });
  };

  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (puckRef.current) {
        const puckDetail = await puckRef.current.getTransformAsync();
        const [x, y, z] = puckDetail.position;
        const position = localCoordinates.getLocalCoordinates({x, y, z});
        await setPuckPosition(position);
      }
    }, 300);
    setTimeout(() => setIsEnabled(true), 1500);
    return () => clearInterval(interval);
  }, []);

  if (!isEnabled) {
    return null;
  }

  return (
    <Viro3DObject
      ref={puckRef}
      source={packModel}
      position={[0, 0.05, 0]}
      materials={['red']}
      type={'OBJ'}
      rotation={[0, 0, 0]}
      scale={[0.001, 0.001, 0.001]}
      physicsBody={{
        type: 'Dynamic',
        mass: 1,
        shape: {
          type: 'Box',
          params: [0.1, 0.01, 0.1],
        },
      }}
    />
  );
});

export default Puck;