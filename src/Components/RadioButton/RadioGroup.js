import React, { PureComponent, Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';

import RadioButton from './RadioButton';

const defaultSize = 20;
const defaultThickness = 1;
const defaultColor = '#007AFF';

export default class RadioGroup extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      selectedIndex: this.props.selectedIndex,
    };
    this.prevSelected = this.props.selectedIndex;
    this.onSelect = this.onSelect.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // console.log('Next selected index', nextProps.selectedIndex, ' extra', nextProps.extra)
    if (nextProps.selectedIndex != this.prevSelected) {
      this.prevSelected = nextProps.selectedIndex;
      this.setState({
        selectedIndex: nextProps.selectedIndex,
      });
    }
    //component in map do not re-mount, only there props update so we send an extra prop
    //which is the focusedquestion index key, when it changes, selected index goes null
    if (nextProps.extra != this.prevextra) {
      this.prevextra = nextProps.extra;
      this.setState({
        selectedIndex: null,
      });
    }
  }

  getChildContext() {
    return {
      onSelect: this.onSelect,
      size: this.props.size,
      thickness: this.props.thickness,
      color: this.props.color,
      highlightColor: this.props.highlightColor,
    };
  }

  onSelect(index, value, id) {
    this.setState({
      selectedIndex: index,
    });
    if (this.props.onSelect) this.props.onSelect(index, value, id);
  }

  render() {
    var radioButtons = React.Children.map(
      this.props.children,
      (radioButton, index) => {
        if (radioButton) {
          let isSelected = this.state.selectedIndex == index;
          let color =
            isSelected && this.props.activeColor
              ? this.props.activeColor
              : this.props.color;
          let selectedStyle = {};
          if (isSelected) {
            selectedStyle = this.props.selectedIndexStyle;
          }
          return (
            <RadioButton
              color={color}
              activeColor={this.props.activeColor}
              {...radioButton.props}
              style={{ ...selectedStyle, ...radioButton.props.style }}
              index={index}
              isSelected={isSelected}>
              {radioButton.props.children}
            </RadioButton>
          );
        }
        return null;
      },
    );

    return <View style={this.props.style}>{radioButtons}</View>;
  }
}

RadioGroup.childContextTypes = {
  onSelect: PropTypes.func.isRequired,
  size: PropTypes.number.isRequired,
  thickness: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  activeColor: PropTypes.string,
  highlightColor: PropTypes.string,
};

RadioGroup.defaultProps = {
  size: defaultSize,
  thickness: defaultThickness,
  color: defaultColor,
  highlightColor: null,
};
