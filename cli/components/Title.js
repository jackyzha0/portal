import {render} from "ink";
import React from "react";
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';

export default ({text}) => {
  render(
    <Gradient name="rainbow">
      <BigText text={text} />
    </Gradient>
  )
}