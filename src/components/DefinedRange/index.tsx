import React, { ReactElement } from 'react';
import classnames from 'classnames';
import styles from '../../styles';
import { defaultInputRanges, defaultStaticRanges } from '../../defaultRanges';
import { DateRange } from '../DayCell';
import InputRangeField from '../InputRangeField';
import { findNextRangeIndex } from '../../utils';
import { addDays, differenceInCalendarDays } from 'date-fns';

export type DefinedRangeProps = {
  inputRanges?: {label: string, range: (value: number) => DateRange, getCurrentValue: (range: DateRange) => number | "-" | "∞"}[],
  staticRanges?: {label: string, range: () => DateRange, isSelected: (value: DateRange) => boolean, hasCustomRendering?: boolean}[],
  ranges?: DateRange[],
  className?: string,
  headerContent?: ReactElement,
  footerContent?: ReactElement,
  focusedRange?: number[],
  rangeColors?: string[],
  focusNextRangeOnDefinedRangeClick?: boolean,
  onPreviewChange?: (value?: DateRange) => void,
  onChange?: (value: {[x: string]: DateRange}) => void,
  renderStaticRangeLabel?: (staticRange: DefinedRangeProps["staticRanges"][number]) => ReactElement
  onRangeFocusChange?: (range: number[]) => void,
  restrictToFirstRangeLength
};

export default function DefinedRange({
  className,
  headerContent,
  footerContent,
  inputRanges = defaultInputRanges,
  staticRanges = defaultStaticRanges,
  rangeColors = ['#3d91ff', '#3ecf8e', '#fed14c'],
  ranges = [],
  focusedRange = [0, 0],
  focusNextRangeOnDefinedRangeClick,
  restrictToFirstRangeLength,
  onChange,
  onPreviewChange,
  renderStaticRangeLabel,
  onRangeFocusChange,

}: DefinedRangeProps) {
  const [state, setState] = React.useState({ rangeOffset: 0, focusedInput: -1 });

  const getSelectedRange = (ranges: DateRange[], staticRange: DefinedRangeProps['staticRanges'][number]) => {
    const focusedRangeIndex = ranges.findIndex((range) => {
      if (!range.startDate || !range.endDate || range.disabled) {
        return false;
      }

      return staticRange.isSelected(range);
    });

    const selectedRange = ranges[focusedRangeIndex];
    return { selectedRange, focusedRangeIndex };
  };

  const handleRangeChange = (range: DateRange) => {
    const selectedRange = ranges[focusedRange[0]];

    if (!onChange || !selectedRange) {
      return;
    }

    const toChange = {
      [selectedRange.key || `range${focusedRange[0] + 1}`]: { ...selectedRange, ...range }
    }

    if (restrictToFirstRangeLength && focusedRange[0] === 0) {
      const focusedRangeIndex = focusedRange[0];
      ranges.slice(focusedRangeIndex + 1).forEach((currentRange, index) => {
        const currentStartDate = currentRange.startDate;
        let currentEndDate = currentRange.endDate;

        const daysDifference = differenceInCalendarDays(range.endDate, range.startDate);
        currentEndDate = addDays(currentStartDate, daysDifference); 

        toChange[currentRange.key || `range${focusedRangeIndex + 2 + index}`] = {
          ...currentRange,
          startDate: currentStartDate,
          endDate: currentEndDate
        };
      });
    }
        
    if (focusNextRangeOnDefinedRangeClick) {
      const nextFocusRange = [findNextRangeIndex(ranges, focusedRange[0]), 0];
      onRangeFocusChange?.(nextFocusRange);
    }

    onChange?.(toChange);
  };

  const getRangeOptionValue = (option: DefinedRangeProps['inputRanges'][number]) => {
    if (typeof option.getCurrentValue !== 'function') {
      return '';
    }

    const selectedRange = ranges[focusedRange[0]] || { startDate: new Date(), endDate: new Date() };
    return option.getCurrentValue(selectedRange) || '';
  };

  return (
    <div className={classnames(styles.definedRangesWrapper, className)}>
      {headerContent}
      <div className={styles.staticRanges}>
        {staticRanges.map((staticRange, i) => {
          const { selectedRange, focusedRangeIndex } = getSelectedRange(ranges, staticRange);

          let labelContent: string | ReactElement = '';

          if (staticRange.hasCustomRendering) {
            labelContent = renderStaticRangeLabel(staticRange);
          } else {
            labelContent = staticRange.label;
          }

          return (
            <button
              type="button"
              className={classnames(styles.staticRange, {
                [styles.staticRangeSelected]: Boolean(selectedRange)
              })}
              style={{
                color: selectedRange ? selectedRange.color || rangeColors[focusedRangeIndex] : null
              }}
              key={i}
              onClick={() => handleRangeChange(staticRange.range())}
              onFocus={() => onPreviewChange && onPreviewChange(staticRange.range())}
              onMouseOver={() => onPreviewChange && onPreviewChange(staticRange.range())}
              onMouseLeave={() => onPreviewChange && onPreviewChange()}
              disabled={restrictToFirstRangeLength && focusedRange[0] !== 0}
            >
              <span tabIndex={-1} className={styles.staticRangeLabel}>
                {labelContent}
              </span>
            </button>
          );
        })}
      </div>
      <div className={styles.inputRanges}>
        {inputRanges.map((rangeOption, i) => (
          <InputRangeField
            key={i}
            styles={styles}
            label={rangeOption.label}
            onFocus={() => setState({ focusedInput: i, rangeOffset: 0 })}
            onBlur={() => setState({ ...state, rangeOffset: 0 })}
            onChange={(value) => handleRangeChange(rangeOption.range(value))}
            value={getRangeOptionValue(rangeOption)}
            inputDisabled={restrictToFirstRangeLength && focusedRange[0] !== 0}
          />
        ))}
      </div>
      {footerContent}
    </div>
  );
}