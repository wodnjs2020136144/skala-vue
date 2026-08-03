<script setup>
// Day 2 챕터별 실습 데모 모음 — Composition API(3장), Vue Component(4장) Code Challenge.
import ReactiveStateDemo from '../../components/practices/composition/ReactiveStateDemo.vue'
import ComputedWatchersDemo from '../../components/practices/composition/ComputedWatchersDemo.vue'
import LifecycleDemo from '../../components/practices/component/LifecycleDemo.vue'
import PropsEmitsDemo from '../../components/practices/component/PropsEmitsDemo.vue'
import SlotDemo from '../../components/practices/component/SlotDemo.vue'
</script>

<template>
  <div style="padding: 20px">
    <ReactiveStateDemo />
    <hr />
    <ComputedWatchersDemo />
    <hr />
    <LifecycleDemo />
    <hr />
    <PropsEmitsDemo />
    <hr />
    <SlotDemo />
  </div>
</template>
