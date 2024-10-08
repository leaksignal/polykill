import React, { useCallback } from 'react';

import {
	BeaconRiskDisplay,
	ScriptRiskDisplay,
	XHRRiskDisplay
} from 'polykill-common/components/RiskItemDisplay';
import { PKInventory } from 'polykill-core';
import { RiskAssessment200Response } from 'polykill-leakscanner-api-client';
import { createRoot } from 'react-dom/client';
import { FaExternalLinkAlt } from 'react-icons/fa';

export default function Report({
	inventory,
	riskAssessment,
	window = globalThis.window
}: {
	inventory: PKInventory;
	riskAssessment: RiskAssessment200Response;
	window?: Window;
}) {
	const { thirdPartyDomains, url } = inventory;
	const { scripts = [], xhrs = [], beacons = [] } = riskAssessment;

	const now = new Date();

	const print = useCallback(() => {
		window.print();
	}, []);

	const formattedDate =
		now.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}) +
		', ' +
		now.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		}) +
		' UTC';

	return (
		<div>
			<button
				style={{
					position: 'absolute',
					top: '1em',
					right: '1em'
				}}
				onClick={print}
			>
				Print
			</button>
			<p>Polykill - Site Report</p>
			<p>{formattedDate}</p>
			<p>
				<i>
					If you're currently using an ad blocker, disable it to see
					all URLs loaded by this site.
				</i>
			</p>
			<p>
				<b>TLD Inventory (Summary)</b>
			</p>
			<p>
				The following third party domains are running JavaScript on this
				page. Make sure these are trusted domains and review the
				findings from each script loading below.
			</p>
			<ul>
				{thirdPartyDomains.map(tld => (
					<li key={tld}>{tld}</li>
				))}
			</ul>
			<div
				style={{
					breakInside: 'avoid'
				}}
			>
				<p>
					<b>JavaScript Inventory</b>
				</p>
				<p>
					JavaScript files are used to enhance the functionality of
					web pages but can also introduce security risks if not
					properly managed. It is important to monitor and analyze
					these scripts to prevent potential data leaks or malicious
					activities.
				</p>
				{scripts.length > 0 ? (
					<ul
						style={{
							padding: 0
						}}
					>
						{scripts.map(s => (
							<ScriptRiskDisplay riskItem={s}>
								<a
									href={`https://polykill.io/scan/script/${encodeURIComponent(s.url!)}?page=${encodeURIComponent(
										url
									)}`}
									target="_blank"
								>
									View AI Analysis on Polykill.io{' '}
									<FaExternalLinkAlt />
								</a>
							</ScriptRiskDisplay>
						))}
					</ul>
				) : (
					<p>
						<i>No scripts found </i>
					</p>
				)}
			</div>
			<div
				style={{
					breakInside: 'avoid'
				}}
			>
				<p>
					<b>XHR Inventory</b>
				</p>
				<p>
					XMLHttpRequest (XHR) is used to send and receive data from a
					web server asynchronously. Monitoring XHR requests is
					crucial to identify any unauthorized data transfers and
					mitigate the risk of data leaks.
				</p>
				{xhrs.length > 0 ? (
					<ul
						style={{
							padding: 0
						}}
					>
						{xhrs.map(x => (
							<XHRRiskDisplay riskItem={x}>
								<a
									href={`https://polykill.io/scan/xhr/${encodeURIComponent(x.url!)}?page=${encodeURIComponent(
										url
									)}`}
									target="_blank"
								>
									View Full Analysis on Polykill.io{' '}
									<FaExternalLinkAlt />
								</a>
							</XHRRiskDisplay>
						))}
					</ul>
				) : (
					<p>
						<i>No XHRs found </i>
					</p>
				)}
			</div>
			<div
				style={{
					breakInside: 'avoid'
				}}
			>
				<p>
					<b>Beacon Inventory</b>
				</p>
				{beacons.length > 0 ? (
					<ul
						style={{
							padding: 0
						}}
					>
						{beacons.map(b => (
							<BeaconRiskDisplay riskItem={b}>
								<a
									href={`https://polykill.io/scan/beacon/${encodeURIComponent(b.url!)}?page=${encodeURIComponent(
										url
									)}`}
									target="_blank"
								>
									View Full Analysis on Polykill.io{' '}
									<FaExternalLinkAlt />
								</a>
							</BeaconRiskDisplay>
						))}
					</ul>
				) : (
					<p>
						<i>No beacons found </i>
					</p>
				)}
			</div>
		</div>
	);
}

export function openReportWindow({
	inventory,
	riskAssessment
}: {
	inventory: PKInventory;
	riskAssessment: RiskAssessment200Response;
}) {
	const newWindow = window.open('', '_blank', 'width=800,height=600');

	if (newWindow) {
		newWindow.document.write(`
	  <!DOCTYPE html>
	  <html lang="en">
	  <head>
		<meta charset="UTF-8">
		<title>Site Report</title>
		<style>
		  body {
			font-family: Arial, sans-serif;
			padding: 20px;
		  }
		</style>
	  </head>
	  <body>
		<div id="root"></div>
	  </body>
	  </html>
	`);
		const container = newWindow.document.getElementById('root');

		if (!container) {
			return;
		}

		const root = createRoot(container);

		root.render(
			<Report
				inventory={inventory}
				riskAssessment={riskAssessment}
				window={newWindow}
			/>
		);
	}
}
