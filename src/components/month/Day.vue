<template>
  <div
    :id="'day-' + day.dateTimeString.substring(0, 10)"
    class="calendar-month__weekday"
    :class="{ 'is-droppable': canBeDropped }"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @dragend="handleDragEnd"
  >
    <span v-if="isFirstWeek" class="calendar-month__day-name">
      {{ day.dayName }}
    </span>

    <span class="calendar-month__day-date">
      {{ day.dateTimeString.substring(8, 10) }}
    </span>

    <div
      v-for="(calendarEvent, index) in day.events"
      :key="index"
      class="calendar-month__event-wrapper"
    >
      <Event
        v-if="index < 3"
        :key="calendarEvent.id"
        :calendar-event="calendarEvent"
        :config="config"
        :time="time"
        :day="day"
        @event-was-clicked="$emit('event-was-clicked', $event)"
      />
    </div>

    <div
      v-if="day.events.length >= 4"
      class="calendar-month__weekday-more"
      @click="switchToWeekMode"
    >
      {{ getLanguage(languageKeys.moreEvents, time.CALENDAR_LOCALE) }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { configInterface } from '../../typings/config.interface';
import Time from '../../helpers/Time';
import Event from './Event.vue';
import { dayInterface } from '../../typings/interfaces/day.interface';
import getLanguage from '../../language/index';
import { eventInterface } from '../../typings/interfaces/event.interface';

export default defineComponent({
  name: 'Day',

  components: { Event },

  mixins: [getLanguage],

  props: {
    config: {
      type: Object as PropType<configInterface>,
      required: true,
    },
    time: {
      type: Object as PropType<Time>,
      required: true,
    },
    day: {
      type: Object as PropType<dayInterface>,
      required: true,
    },
    isFirstWeek: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['event-was-clicked', 'event-was-dragged', 'updated-period'],

  data() {
    return {
      isActiveDroppable: false,
    };
  },

  computed: {
    canBeDropped() {
      return this.isActiveDroppable;
    },
  },

  methods: {
    switchToWeekMode() {
      const { date, month, year } = this.time.getAllVariablesFromDateTimeString(
        this.day.dateTimeString
      );
      const selectedDate = new Date(year, month, date);
      const week = this.time.getCalendarWeekDateObjects(selectedDate);
      const start = week[0];
      const end = week[6];

      this.$emit('updated-period', { start, end, selectedDate });
    },

    handleDragLeave() {
      this.isActiveDroppable = false;
    },

    handleDragEnd(mouseEvent: DragEvent) {
      this.isActiveDroppable = false;
      mouseEvent.stopPropagation();
    },

    handleDrop(dropEvent: DragEvent) {
      this.isActiveDroppable = false;
      dropEvent.stopPropagation();

      if (!dropEvent || !dropEvent.dataTransfer) return;

      const calendarEvent: eventInterface = JSON.parse(
        dropEvent.dataTransfer.getData('json')
      );
      const eventDroppedOnSameDay = this.time.dateStringsHaveEqualDates(
        calendarEvent.time.start,
        this.day.dateTimeString.substring(0, 10)
      );
      if (eventDroppedOnSameDay) return;

      // Exchange the yyyy-mm-dd part of the string
      calendarEvent.time.start = calendarEvent.time.start.replace(
        /^\d{4}-\d{2}-\d{2}/,
        this.day.dateTimeString.substring(0, 10)
      );
      calendarEvent.time.end = calendarEvent.time.end.replace(
        /^\d{4}-\d{2}-\d{2}/,
        this.day.dateTimeString.substring(0, 10)
      );
      this.$emit('event-was-dragged', calendarEvent);
    },

    handleDragOver(e: DragEvent) {
      this.isActiveDroppable = true;
      e.preventDefault();

      return false;
    },
  },
});
</script>

<style lang="scss" scoped>
.calendar-month__weekday {
  height: 100%;
  flex: 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  border-right: var(--qalendar-border-gray-thin);
  border-bottom: var(--qalendar-border-gray-thin);
  overflow: hidden;
  transition: background-color 0.2s ease-in-out;

  &.is-droppable {
    background-color: var(--qalendar-light-gray);
  }

  &:last-child {
    border-right: 0;
  }

  .calendar-month__week:first-child & {
    border-top: var(--qalendar-border-gray-thin);
  }

  .calendar-month__day-name,
  .calendar-month__day-date {
    font-size: var(--qalendar-font-xs);
    color: var(--qalendar-gray-quite-dark);

    &:first-child {
      margin-top: 6px;
    }
  }

  .calendar-month__event-wrapper {
    width: 100%;
  }

  .calendar-month__weekday-more {
    font-size: var(--qalendar-font-2xs);
    width: 100%;
    padding-left: 4px;
    color: var(--qalendar-gray-quite-dark);
    cursor: pointer;
  }
}
</style>
