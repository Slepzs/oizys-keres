import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, spacing } from "@/constants/theme";
import { SKILL_DEFINITIONS, xpForSkillLevel } from "@/game/data";
import { skillSpeedMultiplier } from "@/game/data/curves";
import { skillXpProgress, skillXpRequired } from "@/game/logic";
import type { SkillId, SkillState } from "@/game/types";
import { formatNumber } from "@/utils/format";
import { ProgressBar } from "../common/ProgressBar";

interface SkillProgressBarProps {
	skill: SkillState;
	skillId: SkillId;
	isActive?: boolean;
	showNumbers?: boolean;
}

export function SkillProgressBar({
	skill,
	skillId,
	isActive = false,
	showNumbers = true,
}: SkillProgressBarProps) {
	const xpRequired = xpForSkillLevel(skill.level + 1);
	const xpProgress = xpRequired > 0 ? skill.xp / xpRequired : 1;

	// Calculate action progress for smooth bar animation
	const definition = SKILL_DEFINITIONS[skillId];
	const speedMult = skillSpeedMultiplier(skill.level);
	const effectiveTicksPerAction = definition.ticksPerAction / speedMult;
	const actionProgress =
		isActive && effectiveTicksPerAction > 0
			? (skill.tickProgress ?? 0) / effectiveTicksPerAction
			: 0;

	return (
		<View style={styles.container}>
			{/* Action progress - fills smoothly as you work */}
			<View style={styles.actionProgressContainer}>
				<ProgressBar
					progress={actionProgress}
					height={6}
					color={isActive ? colors.primary : colors.xpBar}
				/>
				{isActive && actionProgress > 0 && (
					<View
						style={[
							styles.actionIndicator,
							{ left: `${actionProgress * 100}%` },
						]}
					/>
				)}
			</View>

			{/* XP progress - shows progress to next level */}
			<View style={styles.xpProgressContainer}>
				<ProgressBar progress={xpProgress} height={3} color={colors.xpBar} />
			</View>

			{showNumbers && (
				<View style={styles.numbers}>
					<Text style={styles.xp}>
						{formatNumber(skill.xp)} / {formatNumber(xpRequired)} XP
					</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
	},
	actionProgressContainer: {
		position: "relative",
	},
	actionIndicator: {
		position: "absolute",
		top: -1,
		width: 2,
		height: 8,
		backgroundColor: colors.text,
		marginLeft: -1,
		borderRadius: 1,
	},
	xpProgressContainer: {
		marginTop: spacing.xs,
	},
	numbers: {
		marginTop: spacing.xs,
		alignItems: "flex-end",
	},
	xp: {
		fontSize: fontSize.xs,
		color: colors.textSecondary,
	},
});
