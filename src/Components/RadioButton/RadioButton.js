import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableWithoutFeedback } from 'react-native';

export default class RadioButton extends Component {
  constructor(props, context) {
    super(props, context);
  }

  UNSAFE_componentDidUpdate(prevProps) {
    if (prevProps.selectedIndex != this.props.selectedIndex) {
      this.setState({
        selectedIndex: this.props.selectedIndex,
      });
    }
  }

  getRadioStyle() {
    return {
      height: this.context.size,
      width: this.context.size,
      borderRadius: this.context.size / 2,
      borderWidth: this.context.thickness,
      borderColor:
        this.props.isSelected && this.props.activeColor
          ? this.props.activeColor
          : this.context.color,
    };
  }

  getRadioDotStyle() {
    return {
      height: this.context.size / 2,
      width: this.context.size / 2,
      borderRadius: this.context.size / 4,
      backgroundColor: this.props.color || this.props.activeColor,
    };
  }

  isSelected() {
    let previous_selected = !this.props.isSelected ? this.props.test : false;
    if (this.props.isSelected) {
      return <View style={this.getRadioDotStyle()} />;
    } else {
      if (previous_selected && this.props.isPrev) {
        return <View style={this.getRadioDotStyle()} />;
      }
    }
  }
  render() {
    var { children, test } = this.props;
    return (
      <View style={{ opacity: this.props.disabled ? 0.9 : 1 }}>
        <TouchableWithoutFeedback
          disabled={this.props.disabled}
          onPress={() => {
            this.context.onSelect(
              this.props.index,
              this.props.value,
              this.props.id,
            );
          }}>
          <View style={[styles.container, this.props.style]}>
            <View style={[styles.radio, this.getRadioStyle()]}>
              {this.isSelected()}
            </View>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

RadioButton.contextTypes = {
  onSelect: PropTypes.func.isRequired,
  size: PropTypes.number.isRequired,
  thickness: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  highlightColor: PropTypes.string,
};

let styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: 'row',
    margin: 3,
    padding: 3,
  },
  radio: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'pink',
  },
});